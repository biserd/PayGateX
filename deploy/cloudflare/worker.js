import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";

const port = 8080;
const inactivityMs = 30 * 60 * 1000;
const retrySeconds = 5;
const emailHost = "paygate-email.internal";

export class SignInEmail extends WorkerEntrypoint {
  async fetch(request) {
    if (new URL(request.url).pathname !== "/sign-in" || request.method !== "POST") {
      return new Response(null, { status: 404 });
    }
    const { PAYGATE_SIGN_IN_FROM: from, SIGN_IN_EMAIL: mailer, PAYGATE_PREVIEW_ORIGIN: origin } = this.env;
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

function warmingResponse(request) {
  const headers = {
    "Cache-Control": "no-store",
    "Retry-After": String(retrySeconds),
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (request.method === "GET" && request.headers.get("Accept")?.includes("text/html")) {
    return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="${retrySeconds}">
    <title>PayGate402 staging is starting</title>
    <style>
      body { margin: 0; padding: 12vh 1.5rem; background: #f8fafc; color: #0f172a; font: 1rem/1.6 system-ui, sans-serif; }
      main { max-width: 32rem; margin: auto; }
      h1 { line-height: 1.2; }
    </style>
  </head>
  <body>
    <main>
      <h1>PayGate402 staging is starting</h1>
      <p>This page refreshes automatically until the sandbox is ready.</p>
    </main>
  </body>
</html>`, { status: 503, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
  }
  return Response.json({ error: "The staging sandbox is starting. Retry shortly." }, { status: 503, headers });
}

export class PaygateStaging extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    if (ctx.container?.running) {
      ctx.waitUntil(ctx.container.setInactivityTimeout(inactivityMs));
    }
  }

  fetch(request) {
    const container = this.ctx.container;
    if (!container) return new Response("Staging container is unavailable", { status: 503 });
    return this.forward(request, container);
  }

  start(container) {
    if (!container.running) {
      this.ready = false;
      this.emailIntercepted = false;
      container.start({
        enableInternet: true,
        env: {
          PORT: String(port),
          PAYGATE_PREVIEW_ORIGIN: this.env.PAYGATE_PREVIEW_ORIGIN,
          PAYGATE_EMAIL_BRIDGE: `http://${emailHost}/sign-in`,
        },
      });
      this.ctx.waitUntil(container.monitor().then(() => {
        this.ready = false;
        console.log("PayGate402 staging container exited");
      }).catch(error => {
        this.ready = false;
        console.error("PayGate402 staging container startup failed", error instanceof Error ? error.message : String(error));
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
    let tcp;
    try {
      this.start(container);
      if (!this.emailIntercepted) {
        await container.interceptOutboundHttp(emailHost, this.ctx.exports.SignInEmail);
        this.emailIntercepted = true;
      }
      tcp = container.getTcpPort(port);
      if (!this.ready && !await this.checkReady(tcp)) return warmingResponse(request);
      this.ready = true;
    } catch (error) {
      console.log("PayGate402 staging readiness check", error instanceof Error ? error.message : String(error));
      return warmingResponse(request);
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
      result.headers.set("X-Robots-Tag", "noindex, nofollow");
      return result;
    } catch (error) {
      this.ready = false;
      console.error("PayGate402 staging unavailable", error instanceof Error ? error.message : "request failed");
      return Response.json({ error: "The staging sandbox did not return a response." }, {
        status: 502, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
      });
    }
  }
}

export default {
  fetch(request, env) {
    if (new URL(request.url).origin !== env.PAYGATE_PREVIEW_ORIGIN) {
      return new Response("Not found", { status: 404 });
    }
    return env.APP.getByName("sandbox").fetch(request);
  },
};
