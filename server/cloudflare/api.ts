import type { Express } from "express";
import { z } from "zod";
import { PaygateStore } from "../paygate/store";
import { registerPaygate } from "../paygate/routes";
import { paygateRuntime, type PaygateTestFixtures } from "../paygate/runtime";
import type { D1Sql } from "./d1";
import { registerIdentity, takeRequestSlot, type SignInMailer } from "./identity";

const contact = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
}).strict();

export async function registerCloudflareApi(app: Express, options: {
  db: D1Sql;
  origin: string;
  key: string;
  mailer: SignInMailer;
  fixtures?: PaygateTestFixtures;
  contactBridge?: string;
}) {
  const { db, origin, key, mailer, fixtures, contactBridge } = options;
  const runtime = await paygateRuntime(origin, key, fixtures);
  const health = () => db.query("SELECT 1 FROM seller_users LIMIT 1");
  await health();
  if (origin.startsWith("https:")) app.set("trust proxy", 1);

  app.get("/healthz", async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      await health();
      res.json({ ok: true, database: "d1" });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  const identity = registerIdentity(app, db, origin, mailer);
  registerPaygate(app, {
    ...runtime, store: new PaygateStore(db, "sqlite"), identity, getSeller: identity.seller,
  });

  app.get("/api/public/directory/categories", (_req, res) => res.json([]));
  app.get("/api/public/directory", async (_req, res, next) => {
    try {
      const { rows } = await db.query<{ id: string; name: string; description: string; price: string }>(
        `SELECT id, config->>'name' AS name, config->>'description' AS description, config->>'price' AS price
         FROM paygate_operations WHERE status = 'published' ORDER BY updated_at DESC LIMIT 100`,
      );
      res.json(rows.map(row => ({ ...row, network: "base-sepolia", isActive: true, url: origin + "/x402/tools/" + row.id })));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/contact", async (req, res, next) => {
    if (!req.is("application/json") || (req.get("Origin") && req.get("Origin") !== origin)) return res.sendStatus(403);
    const submission = contact.safeParse(req.body);
    if (!submission.success) return res.status(400).json({ error: "Check the contact form fields and try again." });
    if (!contactBridge) return res.status(503).json({ error: "Contact form is temporarily unavailable." });
    try {
      if (!await takeRequestSlot(db, "contact:" + req.ip, 3)) {
        return res.set("Retry-After", "900").status(429).json({ error: "Too many messages. Try again in a few minutes." });
      }
      const response = await fetch(contactBridge, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission.data), signal: AbortSignal.timeout(12_000),
      }).catch(() => undefined);
      if (!response?.ok) return res.status(503).json({ error: "Your message could not be sent. Try again shortly." });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
}
