import type { Express } from "express";
import { and, eq } from "drizzle-orm";
import { apiKeys } from "@shared/schema";
import { db, pool } from "../db";
import { registerPaygate } from "./routes";
import { PaygateStore } from "./store";
import { paygateRuntime, type PaygateTestFixtures } from "./runtime";

export type { PaygateTestFixtures } from "./runtime";

export async function setupPaygate(app: Express, fixtures?: PaygateTestFixtures) {
  if (!process.env.PAYGATE_PUBLIC_URL) return;
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("Configure SESSION_SECRET with at least 32 characters");
  const runtime = await paygateRuntime(process.env.PAYGATE_PUBLIC_URL, process.env.PAYGATE_SECRET_KEY ?? "", fixtures);
  await pool.query("SELECT 1 FROM paygate_operations LIMIT 1");
  await pool.query("SELECT 1 FROM auth_login_links LIMIT 1");
  registerPaygate(app, {
    ...runtime,
    store: new PaygateStore(pool),
    identity: {
      async getApiKeyByHash(hash) {
        const [entry] = await db.select({
          orgId: apiKeys.orgId, isActive: apiKeys.isActive, revokedAt: apiKeys.revokedAt,
        }).from(apiKeys).where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.isActive, true))).limit(1);
        return entry;
      },
    },
  });
}
