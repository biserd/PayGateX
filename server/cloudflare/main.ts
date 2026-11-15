import express, { type NextFunction, type Request, type Response } from "express";
import { registerCloudflareApi } from "./api";
import { containerD1 } from "./d1";
import { hasEmailSender, sendSignInLink } from "../email-service";

const { PAYGATE_PUBLIC_URL, PAYGATE_SECRET_KEY, PAYGATE_D1_BRIDGE, PAYGATE_CONTACT_BRIDGE } = process.env;
if (!PAYGATE_PUBLIC_URL || !PAYGATE_SECRET_KEY || !PAYGATE_D1_BRIDGE) {
  throw new Error("The Cloudflare production Worker is missing required configuration");
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "128kb" }));
await registerCloudflareApi(app, {
  db: containerD1(PAYGATE_D1_BRIDGE), origin: PAYGATE_PUBLIC_URL, key: PAYGATE_SECRET_KEY,
  mailer: { available: hasEmailSender, send: sendSignInLink }, contactBridge: PAYGATE_CONTACT_BRIDGE,
});
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((error: { status?: number; name?: string }, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(error);
  const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 500;
  if (status === 500) console.error("PayGate402 API request failed", error.name);
  res.status(status).json({ error: status === 413 ? "Request is too large" : status === 400 ? "Invalid JSON" : "PayGate402 could not complete the request" });
});
app.listen(Number(process.env.PORT || 8080), "0.0.0.0", () => console.log("PayGate402 D1 API is ready"));
