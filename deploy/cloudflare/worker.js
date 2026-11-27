import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import { appPages, indexablePages, isServicePath, prerenderedAsset } from "../../shared/public-pages";

const port = 8080;
const inactivityMs = 30 * 60 * 1000;
const retrySeconds = 5;
const emailHost = "paygate-email.internal";
const databaseHost = "paygate-d1.internal";
const publicOrigin = env => env.PAYGATE_PUBLIC_URL ?? env.PAYGATE_PREVIEW_ORIGIN;
const publicFiles = new Set(["/favicon.svg", "/robots.txt", "/sitemap.xml"]);
const hasProductionStorage = env => Boolean(env.DB && env.PAYGATE_SECRET_KEY);

// Only the container's outbound HTTP intercept can reach this entrypoint.
// Public requests use the distinct default export below.
export class PaygateDatabase extends WorkerEntrypoint {
  async fetch(request) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/batch") {
      return new Response(null, { status: 404 });
    }
    try {
      const batch = await request.json();
      if (!Array.isArray(batch) || batch.length < 1 || batch.length > 10) return new Response(null, { status: 400 });
      const statements = batch.map(({ sql, params }) => this.env.DB.prepare(sql).bind(...params));
      const results = await this.env.DB.batch(statements);
      return Response.json(results.map(result => result.results), { headers: { "Cache-Control": "no-store" } });
    } catch {
      console.error("PayGate402 D1 batch failed");
      return new Response(null, { status: 500 });
    }
  }
}

export class SignInEmail extends WorkerEntrypoint {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (!["/sign-in", "/contact"].includes(path) || request.method !== "POST") {
      return new Response(null, { status: 404 });
    }
    const { PAYGATE_SIGN_IN_FROM: from, SIGN_IN_EMAIL: mailer } = this.env;
    const origin = publicOrigin(this.env);
    if (!from || !mailer) return new Response(null, { status: 503 });
    try {
      const body = await request.json();
      const { email, link } = body;
      if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(null, { status: 400 });
      }
      if (path === "/contact") {
        const to = this.env.PAYGATE_SUPPORT_EMAIL;
        const { name, subject, message } = body;
        if (!to) return new Response(null, { status: 503 });
        if (typeof name !== "string" || name.length > 150 || typeof subject !== "string" || subject.length > 200
          || typeof message !== "string" || message.length > 5000) return new Response(null, { status: 400 });
        await mailer.send({
          from: { email: from, name: "PayGate402" }, to, replyTo: email, subject: "PayGate402 support request",
          text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
        });
        return new Response(null, { status: 204 });
      }
      const url = new URL(link);
      if (url.origin !== origin || url.pathname !== "/auth" || url.search || url.username || url.password
        || !/^#token=[A-Za-z0-9_-]{43}$/.test(url.hash)) {
        return new Response(null, { status: 400 });
      }
      const result = await mailer.send({
        from: { email: from, name: "PayGate402" },
        to: email,
        subject: "Your PayGate402 sign-in link",
        text: `Open this link to sign in to PayGate402:\n\n${url.href}\n\nThe link can be used once and expires in 15 minutes. If you didn't request it, you can ignore this email.`,
      });
      console.log("PayGate402 sign-in email accepted by Cloudflare", result.messageId);
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error("Cloudflare email failed", error?.code ?? "send failed");
      return new Response(null, { status: 503 });
    }
  }
}

function unavailableResponse(request, staging) {
  const headers = {
    "Cache-Control": "no-store",
    "Retry-After": String(retrySeconds),
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (request.method === "GET" && request.headers.get("Accept")?.includes("text/html")) {
    const title = staging ? "PayGate402 staging is starting" : "PayGate402 is starting";
    const message = staging ? "This page refreshes automatically until the sandbox is ready."
      : "This page refreshes automatically.";
    return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="${retrySeconds}">
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 12vh 1.5rem; background: #f8fafc; color: #0f172a; font: 1rem/1.6 system-ui, sans-serif; }
      main { max-width: 32rem; margin: auto; }
      h1 { line-height: 1.2; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`, { status: 503, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
  }
  const error = staging ? "The staging sandbox is starting. Retry shortly." : "PayGate402 is starting. Retry shortly.";
  return Response.json({ error }, { status: 503, headers });
}

class PaygateContainer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    if (ctx.container?.running) {
      ctx.waitUntil(ctx.container.setInactivityTimeout(inactivityMs));
    }
  }

  fetch(request) {
    const container = this.ctx.container;
    if (!container) return unavailableResponse(request, !this.env.PAYGATE_PUBLIC_URL);
    return this.forward(request, container);
  }

  start(container) {
    if (!container.running) {
      this.ready = false;
      const production = this.env.PAYGATE_PUBLIC_URL;
      const env = { PORT: String(port), PAYGATE_EMAIL_BRIDGE: `http://${emailHost}/sign-in` };
      if (production) {
        const { PAYGATE_SECRET_KEY, PAYGATE_FACILITATOR_URL, PAYGATE_RPC_URL } = this.env;
        Object.assign(env, {
          PAYGATE_SECRET_KEY, PAYGATE_PUBLIC_URL: production,
          PAYGATE_D1_BRIDGE: `http://${databaseHost}/batch`,
          PAYGATE_CONTACT_BRIDGE: `http://${emailHost}/contact`,
        });
        if (PAYGATE_FACILITATOR_URL) env.PAYGATE_FACILITATOR_URL = PAYGATE_FACILITATOR_URL;
        if (PAYGATE_RPC_URL) env.PAYGATE_RPC_URL = PAYGATE_RPC_URL;
      } else {
        env.PAYGATE_PREVIEW_ORIGIN = this.env.PAYGATE_PREVIEW_ORIGIN;
      }
      container.start({
        enableInternet: true,
        env,
      });
      this.ctx.waitUntil(container.monitor().then(() => {
        this.ready = false;
        console.log("PayGate402 container exited");
      }).catch(error => {
        this.ready = false;
        console.error("PayGate402 container startup failed", error instanceof Error ? error.message : String(error));
      }));
      this.ctx.waitUntil(container.setInactivityTimeout(inactivityMs));
    }
  }

  async checkReady(tcp) {
    const check = await tcp.fetch("http://localhost/healthz", { signal: AbortSignal.timeout(2000) });
    await check.body?.cancel();
    return check.ok;
  }

  async forward(request, container) {
    const staging = !this.env.PAYGATE_PUBLIC_URL;
    let tcp;
    try {
      if (!this.interceptsReady || !container.running) {
        await this.ctx.blockConcurrencyWhile(async () => {
          if (this.interceptsReady && container.running) return;
          await container.interceptOutboundHttp(emailHost, this.ctx.exports.SignInEmail);
          if (!staging) await container.interceptOutboundHttp(databaseHost, this.ctx.exports.PaygateDatabase);
          this.start(container);
          this.interceptsReady = true;
        });
      }
      tcp = container.getTcpPort(port);
      if (!this.ready && !await this.checkReady(tcp)) return unavailableResponse(request, staging);
      this.ready = true;
    } catch (error) {
      console.log("PayGate402 readiness check", error instanceof Error ? error.message : String(error));
      return unavailableResponse(request, staging);
    }
    try {
      const headers = new Headers(request.headers);
      headers.set("x-forwarded-proto", "https");
      headers.delete("x-forwarded-host");
      headers.delete("x-forwarded-for");
      const clientIp = request.headers.get("cf-connecting-ip");
      if (clientIp) headers.set("x-forwarded-for", clientIp);
      const incoming = new URL(request.url);
      incoming.protocol = "http:";
      const forwarded = new Request(new Request(incoming, request), { headers });
      const response = await tcp.fetch(forwarded);
      const result = new Response(response.body, response);
      result.headers.set("Cache-Control", "no-store");
      if (staging) result.headers.set("X-Robots-Tag", "noindex, nofollow");
      return result;
    } catch (error) {
      this.ready = false;
      console.error("PayGate402 unavailable", error instanceof Error ? error.message : "request failed");
      return Response.json({ error: "PayGate402 did not return a response." }, {
        status: 502, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
      });
    }
  }
}

export class PaygateStaging extends PaygateContainer {}
export class PaygateProduction extends PaygateContainer {}

async function servePublicAssets(request, url, assets) {
  if (publicFiles.has(url.pathname) || url.pathname.startsWith("/assets/")) return assets.fetch(request);
  const page = url.pathname.replace(/\/+$/, "") || "/";
  if (isServicePath(page)) return;
  if (page === "/index.html") return Response.redirect(new URL("/" + url.search, url), 308);
  const read = path => assets.fetch(new Request(new URL(path, url), { method: request.method }));
  const indexable = indexablePages.has(page);
  let html = appPages.has(page) ? await read("/index.html")
    : indexable || page.startsWith("/docs/") ? await read(prerenderedAsset(page)) : null;
  const missing = !html || html.status === 404;
  if (missing) {
    await html?.body?.cancel();
    html = await read(prerenderedAsset("/404"));
  }
  const headers = new Headers(html.headers);
  headers.set("Cache-Control", "no-cache");
  if (!indexable || missing) headers.set("X-Robots-Tag", "noindex");
  return new Response(request.method === "HEAD" ? null : html.body, {
    status: missing ? 404 : html.status,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (env.PAYGATE_PUBLIC_URL && url.origin === "https://www.paygate402.com" && ["GET", "HEAD"].includes(request.method)) {
      return Response.redirect(env.PAYGATE_PUBLIC_URL + url.pathname + url.search, 308);
    }
    if (url.origin !== publicOrigin(env)) {
      return new Response("Not found", { status: 404 });
    }
    if (/^\/release-notes(?:\/|$)/i.test(url.pathname)) {
      return new Response(request.method === "HEAD" ? null : "This page has been removed.", {
        status: 410, headers: { "X-Robots-Tag": "noindex" },
      });
    }
    if (env.WEB && ["GET", "HEAD"].includes(request.method)) {
      const asset = await servePublicAssets(request, url, env.WEB);
      if (asset) return asset;
    }
    if (env.PAYGATE_PUBLIC_URL && !hasProductionStorage(env)) {
      return Response.json({ ok: false, error: "PayGate402 is temporarily unavailable." }, {
        status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
      });
    }
    return env.APP.getByName(env.PAYGATE_PUBLIC_URL ? "production" : "sandbox").fetch(request);
  },
};
