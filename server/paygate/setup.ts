import type { Express } from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { and, eq } from "drizzle-orm";
import { apiKeys } from "@shared/schema";
import { db, pool } from "../db";
import { network, paymentService } from "./payment";
import { registerPaygate } from "./routes";
import { PaygateStore } from "./store";
import { upstreamPolicy } from "./upstream";

export interface PaygateTestFixtures {
  upstreamOrigins: string[];
  facilitatorUrl: string;
  rpcUrl: string;
  timeoutMs: number;
}

export async function setupPaygate(app: Express, fixtures?: PaygateTestFixtures) {
  if (!process.env.PAYGATE_PUBLIC_URL) return;
  const url = new URL(process.env.PAYGATE_PUBLIC_URL);
  const local = url.protocol === "http:" && url.hostname === "127.0.0.1";
  if ((!local && url.protocol !== "https:") || url.href !== url.origin + "/") {
    throw new Error("PAYGATE_PUBLIC_URL must be a bare HTTPS origin (or local loopback for development)");
  }
  const secret = process.env.PAYGATE_SECRET_KEY ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(secret)) throw new Error("Configure PAYGATE_SECRET_KEY as 64 hex characters");
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("Configure SESSION_SECRET with at least 32 characters");
  const sandbox = fixtures?.upstreamOrigins ?? (process.env.PAYGATE_SANDBOX_ORIGINS ?? "").split(",").map(v => v.trim()).filter(Boolean);
  if (sandbox.length && (!(local || fixtures) || sandbox.some(v => !/^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(v)))) {
    throw new Error("Sandbox upstream origins are limited to explicit loopback ports on a local gateway");
  }
  const timeout = fixtures?.timeoutMs ?? (local ? Number(process.env.PAYGATE_SANDBOX_TIMEOUT_MS ?? 10_000) : 10_000);
  if (!Number.isInteger(timeout) || timeout < 100 || timeout > 20_000) throw new Error("Invalid upstream timeout");
  const facilitatorUrl = new URL(fixtures?.facilitatorUrl ?? (process.env.PAYGATE_FACILITATOR_URL || "https://x402.org/facilitator"));
  if (facilitatorUrl.protocol !== "https:" && !((local || fixtures) && facilitatorUrl.protocol === "http:" && facilitatorUrl.hostname === "127.0.0.1")) {
    throw new Error("Configure a trusted HTTPS x402 v2 facilitator");
  }
  const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl.href.replace(/\/$/, ""), timeoutMs: 15_000 });
  const supported = await facilitator.getSupported();
  if (!supported.kinds.some(k => k.x402Version === 2 && k.network === network && k.scheme === "exact")) {
    throw new Error("Facilitator must support v2 exact payments on Base Sepolia");
  }
  await pool.query("SELECT 1 FROM paygate_operations LIMIT 1");
  registerPaygate(app, {
    store: new PaygateStore(pool),
    identity: {
      async getApiKeyByHash(hash) {
        const [entry] = await db.select({
          orgId: apiKeys.orgId, isActive: apiKeys.isActive, revokedAt: apiKeys.revokedAt,
        }).from(apiKeys).where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.isActive, true))).limit(1);
        return entry;
      },
    },
    origin: url.origin, key: Buffer.from(secret, "hex"),
    upstream: upstreamPolicy(new Set(sandbox), timeout),
    payments: paymentService(facilitator, fixtures?.rpcUrl ?? process.env.PAYGATE_RPC_URL),
  });
}
