import { DurableObject } from "cloudflare:workers";

const port = 8080;
const inactivityMs = 30 * 60 * 1000;

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
      this.ctx.waitUntil(container.monitor().then(() => {
        console.log("PayGate402 staging container exited");
      }).catch(error => {
        console.error("PayGate402 staging container startup failed", error instanceof Error ? error.message : String(error));
      }));
      await container.setInactivityTimeout(inactivityMs);
    }
    const tcp = container.getTcpPort(port);
    await this.waitForReady(tcp);
  }

  async waitForReady(tcp) {
    let lastError;
    for (let i = 0; i < 120; i++) {
      try {
        const check = await tcp.fetch("http://localhost/healthz", { signal: AbortSignal.timeout(3000) });
        await check.body?.cancel();
        if (check.ok) return;
      } catch (error) { lastError = error; }
      await scheduler.wait(500);
    }
    throw new Error("Staging sandbox did not pass its startup checks", { cause: lastError });
  }

  async forward(request, container) {
    try {
      if (!this.readiness) this.readiness = this.start(container);
      await this.readiness;
      const headers = new Headers(request.headers);
      headers.set("x-forwarded-proto", "https");
      headers.delete("x-forwarded-host");
      const incoming = new URL(request.url);
      incoming.protocol = "http:";
      const forwarded = new Request(new Request(incoming, request), { headers });
      const response = await container.getTcpPort(port).fetch(forwarded);
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
