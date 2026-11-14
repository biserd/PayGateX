import { DurableObject } from "cloudflare:workers";

const port = 8080;
const inactivityMs = 30 * 60 * 1000;

export class PaygateStaging extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    if (ctx.container?.running) {
      ctx.blockConcurrencyWhile(() => ctx.container.setInactivityTimeout(inactivityMs));
    }
  }

  fetch(request) {
    const container = this.ctx.container;
    if (!container) return new Response("Staging container is unavailable", { status: 503 });
    if (!this.readiness) {
      this.readiness = this.start(container).catch(error => {
        this.readiness = undefined;
        throw error;
      });
    }
    return this.forward(request, container);
  }

  async start(container) {
    if (!container.running) {
      container.start({
        enableInternet: true,
        env: {
          PORT: String(port),
          PAYGATE_PREVIEW_ORIGIN: this.env.PAYGATE_PREVIEW_ORIGIN,
          PAYGATE_PREVIEW_PASSWORD: this.env.PAYGATE_PREVIEW_PASSWORD,
        },
      });
      await container.setInactivityTimeout(inactivityMs);
    }
    const tcp = container.getTcpPort(port);
    for (let i = 0; i < 90; i++) {
      try {
        const check = await tcp.fetch("http://container/healthz", { signal: AbortSignal.timeout(1500) });
        await check.body?.cancel();
        if (check.ok) return;
      } catch { /* The process is still starting. */ }
      await scheduler.wait(500);
    }
    throw new Error("Staging sandbox did not pass its startup checks");
  }

  async forward(request, container) {
    try {
      await this.readiness;
      const headers = new Headers(request.headers);
      headers.set("x-forwarded-proto", "https");
      headers.delete("x-forwarded-host");
      const incoming = new URL(request.url);
      const target = new URL("http://container");
      target.pathname = incoming.pathname;
      target.search = incoming.search;
      const response = await container.getTcpPort(port).fetch(new Request(target, request), { headers });
      const result = new Response(response.body, response);
      result.headers.set("Cache-Control", "no-store");
      result.headers.set("X-Robots-Tag", "noindex, nofollow");
      return result;
    } catch (error) {
      this.readiness = undefined;
      console.error("PayGate402 staging unavailable", error instanceof Error ? error.message : "request failed");
      return Response.json({ error: "The staging sandbox is starting. Retry shortly." }, {
        status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "5", "X-Robots-Tag": "noindex, nofollow" },
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
