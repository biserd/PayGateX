import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";

const port = 8080;
const inactivityMs = 30 * 60 * 1000;
const retrySeconds = 5;
const emailHost = "paygate-email.internal";
const publicOrigin = env => env.PAYGATE_PUBLIC_URL ?? env.PAYGATE_PREVIEW_ORIGIN;
const publicPages = new Set(["/", "/about", "/faq", "/release-notes", "/contact", "/privacy", "/terms"]);
const publicFiles = new Set(["/favicon.svg", "/robots.txt", "/sitemap.xml"]);
const hasProductionSecrets = env => Boolean(env.DATABASE_URL && env.SESSION_SECRET && env.PAYGATE_SECRET_KEY);

export class SignInEmail extends WorkerEntrypoint {
  async fetch(request) {
    if (new URL(request.url).pathname !== "/sign-in" || request.method !== "POST") {
      return new Response(null, { status: 404 });
    }
    const { PAYGATE_SIGN_IN_FROM: from, SIGN_IN_EMAIL: mailer } = this.env;
    const origin = publicOrigin(this.env);
    if (!from || !mailer) return new Response(null, { status: 503 });
    try {
      const { email, link } = await request.json();
      const url = new URL(link);
      if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || url.origin !== origin || url.pathname !== "/auth" || url.search || url.username || url.password
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
      console.error("Cloudflare sign-in email failed", error?.code ?? "send failed");
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
      this.emailIntercepted = false;
      const production = this.env.PAYGATE_PUBLIC_URL;
      const env = { PORT: String(port), PAYGATE_EMAIL_BRIDGE: `http://${emailHost}/sign-in` };
      if (production) {
        const { DATABASE_URL, SESSION_SECRET, PAYGATE_SECRET_KEY, PAYGATE_FACILITATOR_URL, PAYGATE_RPC_URL } = this.env;
        Object.assign(env, { DATABASE_URL, SESSION_SECRET, PAYGATE_SECRET_KEY, PAYGATE_PUBLIC_URL: production });
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
      this.start(container);
      if (!this.emailIntercepted) {
        await container.interceptOutboundHttp(emailHost, this.ctx.exports.SignInEmail);
        this.emailIntercepted = true;
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
  const indexable = publicPages.has(page);
  if (!indexable && page !== "/auth" && page !== "/docs" && !page.startsWith("/docs/")) return;
  const html = await assets.fetch(new Request(new URL("/index.html", url), { method: request.method }));
  const headers = new Headers(html.headers);
  headers.set("Cache-Control", "no-cache");
  headers.delete("Content-Length");
  headers.delete("ETag");
  if (!indexable) headers.set("X-Robots-Tag", "noindex");
  if (request.method === "HEAD") return new Response(null, { status: html.status, headers });
  const canonical = new URL(page, url.origin).href;
  const body = (await html.text()).replaceAll('"https://paygate402.com/"', JSON.stringify(canonical));
  return new Response(body, { status: html.status, headers });
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
    if (env.WEB && ["GET", "HEAD"].includes(request.method)) {
      const asset = await servePublicAssets(request, url, env.WEB);
      if (asset) return asset;
    }
    if (env.PAYGATE_PUBLIC_URL && !hasProductionSecrets(env)) {
      return Response.json({ ok: false, error: "PayGate402 is temporarily unavailable." }, {
        status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
      });
    }
    return env.APP.getByName(env.PAYGATE_PUBLIC_URL ? "production" : "sandbox").fetch(request);
  },
};
