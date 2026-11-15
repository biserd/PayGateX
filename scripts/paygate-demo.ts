import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import express from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { x402Client } from "@x402/core/client";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader, encodePaymentSignatureHeader } from "@x402/core/http";
import type { PaymentPayload, PaymentRequired } from "@x402/core/types";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { wrapFetchWithPayment } from "@x402/fetch";
import { wrapMCPClientWithPayment } from "@x402/mcp";
import { type SellerOperation } from "../shared/paygate";
import { network, asset } from "../server/paygate/payment";
import { listen, sandbox, secret } from "./paygate-sandbox";

const cleanup: Array<() => Promise<unknown>> = [];
const serving = process.argv.includes("--serve");
const previewOrigin = process.env.PAYGATE_PREVIEW_ORIGIN;
const containerPreview = process.argv.includes("--container");
if (previewOrigin && (!serving || !/^https:\/\/[a-z0-9.-]+$/.test(previewOrigin))) {
  throw new Error("PAYGATE_PREVIEW_ORIGIN requires --serve and a bare HTTPS origin");
}
if (containerPreview && !previewOrigin) throw new Error("Configure the container preview origin");
const app = express().use(express.json({ limit: "128kb" }));
const say = (s: string) => console.log("PASS " + s);
let origin: string;
let localOrigin: string;
let ready = false;
const inbox = new Map<string, string>();
const emailBridge = process.env.PAYGATE_EMAIL_BRIDGE;
const gatewayFetch: typeof fetch = async (input, init) => {
  if (!containerPreview) return fetch(input, init);
  const request = new Request(input, init);
  const url = new URL(request.url);
  if (url.origin !== origin) throw new Error("Sandbox smoke test expected a preview URL");
  const local = new URL(url.pathname + url.search, localOrigin);
  const headers = new Headers(request.headers);
  headers.set("x-forwarded-proto", "https");
  return fetch(new Request(local, request), { headers });
};
async function call(path: string, method = "GET", body?: unknown, headers: Record<string, string> = {}, expected = 200) {
  const res = await gatewayFetch(new URL(path, origin), {
    method, headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await res.json();
  assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  return { data, res };
}
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

try {
  const demo = await sandbox(cleanup);
  const gateway = await listen(createServer(app), serving ? Number(process.env.PORT || 5000) : 0,
    containerPreview ? "0.0.0.0" : "127.0.0.1");
  cleanup.push(gateway.close);
  localOrigin = gateway.origin;
  origin = previewOrigin ?? gateway.origin;
  if (previewOrigin) {
    app.use((_req, res, next) => {
      res.set({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });
      next();
    });
    app.get("/healthz", (_req, res) => res.status(ready ? 200 : 503)
      .json({ ok: ready, environment: "sandbox", checks: ready ? 9 : 0 }));
    app.use(["/api/webhooks", "/api/contact"], (_req, res) => {
      res.status(404).json({ error: "External notifications are disabled in this sandbox" });
    });
  }
  Object.assign(process.env, {
    SESSION_SECRET: randomBytes(32).toString("hex"),
    PAYGATE_PUBLIC_URL: origin, PAYGATE_SECRET_KEY: demo.encryptionKey,
    PAYGATE_ENABLE_LEGACY: "0", PAYGATE_LOCAL_DEMO: "1",
  });
  const { pool } = await import("../server/db");
  cleanup.push(() => pool.end());
  const { registerRoutes } = await import("../server/routes");
  const { sendSignInLink } = await import("../server/email-service");
  await registerRoutes(app, {
    facilitatorUrl: demo.facilitatorUrl, rpcUrl: demo.rpc,
    upstreamOrigins: [demo.weather, demo.inventory], timeoutMs: previewOrigin ? 1500 : 500,
  }, {
    available: () => !containerPreview || !ready || Boolean(emailBridge),
    async send(email, link) {
      if (!ready) {
        inbox.set(email, link);
        return true;
      }
      if (!containerPreview) {
        console.log(`Local sign-in link for ${email}: ${link}`);
        return true;
      }
      return !email.endsWith("@example.test") && Boolean(emailBridge) && sendSignInLink(email, link);
    },
  });
  const api = "/api/seller/v1/operations";
  const buyerPayment = new x402Client().register(network, new ExactEvmScheme(toClientEvmSigner(demo.buyer, demo.publicClient)));
  const paidFetch = wrapFetchWithPayment(gatewayFetch, buyerPayment);

  async function seller(name: string) {
    const email = name + "@example.test";
    await call("/api/auth/email/request", "POST", { email }, {}, 202);
    const link = new URL(inbox.get(email)!);
    assert.equal(link.origin, origin);
    inbox.delete(email);
    const token = new URLSearchParams(link.hash.slice(1)).get("token");
    const signIn = await call("/api/auth/email/redeem", "POST", { token });
    const cookie = signIn.res.headers.get("set-cookie")!.split(";")[0];
    const key = (await call("/api/keys", "POST", { name: "Sandbox CI" }, { cookie })).data;
    assert(!key.keyHash);
    return { cookie, bearer: { Authorization: "Bearer " + key.key }, keyId: key.id };
  }
  const owner = await seller("sandbox_seller");
  const outsider = await seller("other_seller");
  const email = "link_test@example.test";
  await call("/api/auth/email/request", "POST", { email }, { Origin: "https://other.example" }, 403);
  await call("/api/auth/email/request", "POST", { email: email.toUpperCase() }, {}, 202);
  const signInLink = new URL(inbox.get(email)!);
  const token = new URLSearchParams(signInLink.hash.slice(1)).get("token");
  await call("/api/auth/email/request", "POST", { email }, {}, 202);
  assert.equal(inbox.get(email), signInLink.href);
  const redeem = () => gatewayFetch(origin + "/api/auth/email/redeem", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
  });
  const attempts = await Promise.all([redeem(), redeem()]);
  assert.deepEqual(attempts.map(response => response.status).sort(), [200, 400]);
  assert.equal((await attempts.find(response => response.ok)!.json()).email, email);
  assert.equal((await redeem()).status, 400);
  await pool.query("UPDATE auth_login_links SET issued_at = now() - interval '2 minutes' WHERE email = $1", [email]);
  await call("/api/auth/email/request", "POST", { email }, {}, 202);
  const expired = new URLSearchParams(new URL(inbox.get(email)!).hash.slice(1)).get("token");
  await pool.query("UPDATE auth_login_links SET expires_at = now() - interval '1 second' WHERE email = $1", [email]);
  await call("/api/auth/email/redeem", "POST", { token: expired }, {}, 400);
  inbox.delete(email);
  say("email link delivery, same-origin enforcement, concurrent redemption, replay and expiration");
  const session = { cookie: owner.cookie, Origin: origin };
  await call(api, "GET", undefined, {}, 401);
  await call(api + "/import", "POST", {}, { cookie: owner.cookie, Origin: "https://other.example" }, 403);
  const imported = (await call(api + "/import", "POST", {
    path: "/forecast/{city}", method: "GET", document: {
      openapi: "3.1.0", servers: [{ url: demo.weather }], paths: {
        "/forecast/{city}": { get: {
          operationId: "weather_forecast", summary: "Find a forecast by city",
          parameters: [{ in: "path", name: "city", required: true, schema: { type: "string", minLength: 1 } },
            { in: "query", name: "days", required: true, schema: { type: "integer", minimum: 1, maximum: 7 } }],
        } },
      },
    },
  }, owner.bearer)).data;
  const weatherConfig = { ...imported, price: "0.02", payTo: demo.seller.address };
  const reservationConfig = {
    name: "reserve_stock", description: "Reserve units of a SKU", method: "POST", url: demo.inventory + "/reservations",
    statusUrl: demo.inventory + "/outcome", price: "0.03", payTo: demo.seller.address,
    inputSchema: { type: "object", additionalProperties: false, required: ["sku", "units"], properties: {
      sku: { type: "string" }, units: { type: "integer", minimum: 1 }, rush: { type: "boolean" },
    } },
    mappings: [{ input: "sku", in: "body", name: "sku" }, { input: "units", in: "body", name: "quantity" },
      { input: "rush", in: "body", name: "rush" }],
  };
  await call(api, "POST", { config: { ...reservationConfig, url: "https://127.0.0.1/reservations", statusUrl: undefined } }, owner.bearer, 400);
  await call(api, "POST", { config: { ...reservationConfig, url: "https://168.63.129.16/reservations", statusUrl: undefined } }, owner.bearer, 400);
  let weather: SellerOperation = (await call(api, "POST", { config: weatherConfig }, owner.bearer, 201)).data;
  let inventory: SellerOperation = (await call(api, "POST", {
    config: reservationConfig, auth: { type: "header", header: "X-API-Key", value: secret },
  }, session, 201)).data;
  const wx = { city: "Boston", days: 3 }, stock = { sku: "GEAR-9", units: 2, rush: true };
  const pathFor = (op: SellerOperation) => `${api}/${op.id}`;
  for (const op of [weather, inventory]) {
    await call("/x402/tools/" + op.id, "GET", undefined, {}, 404);
    await call("/mcp/" + op.id, "POST", {}, {}, 404);
    await call(pathFor(op), "GET", undefined, outsider.bearer, 404);
    await call(pathFor(op), "PUT", { config: { ...reservationConfig, payTo: demo.buyer.address }, revision: op.revision }, outsider.bearer, 404);
    await call(pathFor(op) + "/publish", "POST", { revision: op.revision }, owner.bearer, 409);
  }
  const stored = await demo.database.query<{ auth_cipher: string }>("SELECT auth_cipher FROM paygate_operations WHERE id = $1", [inventory.id]);
  assert(stored.rows[0].auth_cipher && !stored.rows[0].auth_cipher.includes(secret));
  assert(!JSON.stringify((await call(api, "GET", undefined, session)).data).includes(secret));
  async function publish(op: SellerOperation, input: unknown) {
    const tested = (await call(pathFor(op) + "/test", "POST", { input, revision: op.revision }, owner.bearer)).data;
    assert(tested.ok);
    return (await call(pathFor(op) + "/publish", "POST", { revision: op.revision }, owner.bearer)).data as SellerOperation;
  }
  weather = await publish(weather, wx);
  inventory = await publish(inventory, stock);
  say("seller session and CI key; OpenAPI weather + authenticated inventory, sandbox tested and published");
  say("draft HTTP/MCP privacy, cross-tenant configuration and payout denial, encrypted credentials, destination validation");

  const wxUrl = weather.connection!.http, stockUrl = inventory.connection!.http;
  const header = { "Content-Type": "application/json" };
  const init = (body: unknown, payload?: PaymentPayload) => ({
    method: "POST", headers: { ...header, ...(payload ? { "PAYMENT-SIGNATURE": encodePaymentSignatureHeader(payload) } : {}) },
    body: JSON.stringify(body),
  });
  async function quote(url: string, input: unknown) {
    const before = [demo.reads, demo.attempts, demo.settlements];
    const res = await gatewayFetch(url, init(input));
    assert.equal(res.status, 402);
    const requirement = decodePaymentRequiredHeader(res.headers.get("PAYMENT-REQUIRED")!);
    const body = await res.json();
    assert.equal(requirement.x402Version, 2);
    assert.equal(requirement.resource.url, body.recoveryUrl);
    assert.equal(res.headers.get("PayGate-Purchase-Id"), body.purchaseId);
    assert.equal(requirement.accepts[0].payTo, demo.seller.address);
    assert.deepEqual([demo.reads, demo.attempts, demo.settlements], before);
    return { body, requirement };
  }
  const disclosed = (await call(wxUrl)).data;
  assert.equal(disclosed.price, "0.02");
  assert.equal(disclosed.inputSchema.properties.days.type, "integer");
  assert(!JSON.stringify(disclosed).includes(demo.weather));
  await call(wxUrl, "POST", { city: "Boston", days: "3" }, {}, 400);
  const unpaid = await quote(wxUrl, wx);
  assert.equal(unpaid.requirement.accepts[0].amount, "20000");
  const badSig = await buyerPayment.createPaymentPayload(unpaid.requirement);
  badSig.payload.signature = "0x" + "0".repeat(130);
  const denied = await gatewayFetch(wxUrl, init(wx, badSig));
  assert.equal(denied.status, 402);
  assert.equal((await denied.json()).state, "quoted");
  say("public schema and price; invalid inputs and unpaid/invalid signatures do not call upstream or settle");

  const direct = await paidFetch(wxUrl, init(wx));
  const directResult = await direct.json();
  assert.equal(direct.status, 200, JSON.stringify(directResult));
  const receipt = decodePaymentResponseHeader(direct.headers.get("PAYMENT-RESPONSE")!);
  assert.equal(receipt.success, true);
  assert.equal(receipt.transaction, directResult.receipt.transaction);
  assert.deepEqual(directResult.result, { city: "Boston", days: 3, condition: "clear" });
  assert.equal(directResult.receipt.asset, asset);
  assert.equal((await call(directResult.recoveryUrl)).data.receipt.payTo, demo.seller.address);
  await call("/x402/purchases/" + directResult.purchaseId, "GET", undefined, {}, 404);
  await call("/x402/purchases/" + directResult.purchaseId + "/" + "0".repeat(48), "GET", undefined, {}, 404);
  assert.equal(await demo.balance(demo.seller.address), 20_000n);
  say("official @x402/fetch HTTP purchase; settlement header, stored result/receipt and actual sandbox payout");

  const mcpBase = new Client({ name: "paygate402-sandbox-buyer", version: "1.0.0" });
  await call(inventory.connection!.mcp, "POST", {}, { Origin: "https://other.example" }, 403);
  cleanup.push(() => mcpBase.close());
  let mcpRequired: PaymentRequired | undefined;
  const mcp = wrapMCPClientWithPayment(mcpBase, buyerPayment, { onPaymentRequested: ({ paymentRequired }) => {
    mcpRequired = paymentRequired;
    return paymentRequired.accepts[0].amount === "30000" && paymentRequired.accepts[0].payTo === demo.seller.address;
  } });
  await mcp.connect(new StreamableHTTPClientTransport(new URL(inventory.connection!.mcp), { fetch: gatewayFetch }));
  const tools = await mcp.listTools();
  assert.equal(tools.tools.length, 1);
  assert.equal(tools.tools[0].name, "reserve_stock");
  assert.match(tools.tools[0].description!, /0\.03 USDC/);
  assert.deepEqual(tools.tools[0].inputSchema.required, ["sku", "units"]);
  assert.equal(tools.tools[0].inputSchema.properties?.rush?.type, "boolean");
  const raw = await mcpBase.callTool({ name: "reserve_stock", arguments: stock });
  assert.equal(raw.isError, true);
  assert.equal((raw.structuredContent as PaymentRequired).x402Version, 2);
  const mcpPaid = await mcp.callTool("reserve_stock", stock);
  const mcpResult = JSON.parse((mcpPaid.content[0] as { text: string }).text);
  assert.equal(mcpPaid.isError, false, JSON.stringify(mcpResult));
  assert.equal(mcpPaid.paymentMade, true);
  assert.equal(mcpPaid.paymentResponse?.transaction, mcpResult.receipt.transaction);
  assert.equal(mcpRequired?.resource.url, mcpResult.recoveryUrl);
  assert.equal((await call(mcpResult.recoveryUrl)).data.result.quantity, 2);
  assert.equal(await demo.balance(demo.seller.address), 50_000n);
  say("official @x402/mcp wrapper + MCP TypeScript SDK Streamable HTTP; typed tool, purchase, receipt and payout");

  const retry = await quote(wxUrl, wx);
  const signed = await buyerPayment.createPaymentPayload(retry.requirement);
  const reads = demo.reads, settlements = demo.settlements;
  const concurrent = await Promise.all(Array.from({ length: 5 }, () => gatewayFetch(wxUrl, init(wx, signed))));
  assert(concurrent.every(r => [200, 202].includes(r.status)));
  assert.equal(demo.reads, reads + 1);
  assert.equal(demo.settlements, settlements + 1);
  const storedRetry = (await call(retry.body.recoveryUrl)).data;
  assert.equal(storedRetry.state, "succeeded");
  const otherQuote = await quote(wxUrl, wx);
  const reused = { ...signed, resource: otherQuote.requirement.resource };
  assert.equal((await gatewayFetch(wxUrl, init(wx, reused))).status, 409);
  const distinct = await buyerPayment.createPaymentPayload(retry.requirement);
  assert.equal((await gatewayFetch(wxUrl, init(wx, distinct))).status, 409);
  assert.equal(demo.settlements, settlements + 1);
  say("five concurrent paid retries cause one transfer and one upstream execution; duplicate authorization blocked");

  const bad = await paidFetch(stockUrl, init({ ...stock, sku: "BAD" }));
  const failed = await bad.json();
  assert.equal(bad.status, 424);
  assert.equal(failed.state, "failed");
  assert.equal(failed.upstreamStatus, 422);
  assert.equal(failed.receipt.success, true);
  assert.equal((await call(failed.recoveryUrl)).data.state, "failed");
  const timeout = await paidFetch(stockUrl, init({ ...stock, sku: "TIMEOUT" }));
  const unknown = await timeout.json();
  assert.equal(timeout.status, 202);
  assert.equal(unknown.state, "upstream_unknown");
  const before = [demo.attempts, demo.writes, demo.settlements];
  await call(unknown.recoveryUrl + "/resume", "POST", undefined, {}, 202);
  const recovered = (await call(unknown.recoveryUrl + "/reconcile", "POST")).data;
  assert.equal(recovered.state, "succeeded");
  assert.equal(recovered.result.sku, "TIMEOUT");
  assert.deepEqual([demo.attempts, demo.writes, demo.settlements], before);
  const safeRetry = await (await paidFetch(stockUrl, init({ ...stock, sku: "NEEDS-RETRY" }))).json();
  assert.equal(safeRetry.state, "upstream_unknown");
  assert.equal((await call(safeRetry.recoveryUrl + "/reconcile", "POST", undefined, {}, 202)).data.state, "retryable");
  const retryPaid = (await call(safeRetry.recoveryUrl + "/resume", "POST")).data;
  assert.equal(retryPaid.state, "succeeded");
  assert.equal(retryPaid.receipt.transaction, safeRetry.receipt.transaction);
  say("paid upstream failure preserves receipt; timed-out mutation only resumes after upstream confirms no execution");

  demo.loseNextSettlement();
  const lost = await (await paidFetch(wxUrl, init(wx))).json();
  assert.equal(lost.state, "payment_unknown");
  await demo.mine();
  const settled = (await call(lost.recoveryUrl + "/reconcile", "POST")).data;
  assert.equal(settled.state, "succeeded");
  assert.equal(settled.receipt.success, true);
  const disconnect = await quote(wxUrl, wx);
  const disconnectPayment = await buyerPayment.createPaymentPayload(disconnect.requirement);
  const ctrl = new AbortController();
  const count = demo.reads;
  const dropping = gatewayFetch(wxUrl, { ...init(wx, disconnectPayment), signal: ctrl.signal }).catch(e => e);
  for (let i = 0; i < 300 && demo.reads === count; i++) await delay(10);
  assert.equal(demo.reads, count + 1);
  ctrl.abort();
  await dropping;
  await delay(160);
  assert.equal((await call(disconnect.body.recoveryUrl)).data.state, "succeeded");
  say("lost facilitator response reconciled from sandbox chain; buyer disconnect recovered by purchase URL");

  const oldQuote = await quote(wxUrl, wx);
  weather = (await call(pathFor(weather) + "/price", "PATCH", { revision: weather.revision, price: "0.04" }, owner.bearer)).data;
  assert.equal((await call(wxUrl)).data.price, "0.04");
  assert.equal((await gatewayFetch(wxUrl, init(wx, await buyerPayment.createPaymentPayload(oldQuote.requirement)))).status, 409);
  assert.equal((await call(directResult.recoveryUrl)).data.receipt.price, "0.02");
  weather = (await call(pathFor(weather) + "/pause", "POST", { revision: weather.revision }, owner.bearer)).data;
  await call(wxUrl, "GET", undefined, {}, 404);
  await call(weather.connection?.mcp ?? "/mcp/" + weather.id, "POST", {}, {}, 404);
  assert.equal((await call(directResult.recoveryUrl)).data.state, "succeeded");
  const activity = (await call(pathFor(inventory) + "/activity", "GET", undefined, session)).data;
  assert.deepEqual([activity.calls, activity.revenueAtomic, activity.failures], [4, "120000", 1]);
  assert(!JSON.stringify(activity).includes(secret));
  assert.equal(await demo.balance(demo.seller.address), 200_000n);
  await call("/api/keys/" + outsider.keyId, "DELETE", undefined, { cookie: outsider.cookie });
  await call(api, "GET", undefined, outsider.bearer, 401);
  say("price edits, stale-quote rejection, pause, purchase recovery, metering and key revocation");

  if (serving) {
    weather = (await call(pathFor(weather) + "/price", "PATCH", { revision: weather.revision, price: "0.02" }, owner.bearer)).data;
    weather = (await call(pathFor(weather) + "/publish", "POST", { revision: weather.revision }, owner.bearer)).data;
    if (containerPreview) {
      const canBuy = (req: express.Request) => req.isAuthenticated?.();
      app.get("/staging/buyer", (req, res) => {
        if (!canBuy(req)) return res.redirect("/auth");
        res.type("html").send(`<!doctype html><html lang="en"><meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1"><title>PayGate402 sandbox buyer</title>
          <style>body{font:1rem system-ui;max-width:42rem;margin:3rem auto;padding:0 1rem;color:#172033}
          button{font:inherit;padding:.6rem;margin:.25rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eef2f7;padding:1rem}</style>
          <a href="/dashboard">Back to seller console</a><h1>Sandbox buyer</h1>
          <p>Run a purchase against either published demo tool with the funded sandbox wallet.</p>
          <button data-kind="http">Buy weather over HTTP</button><button data-kind="mcp">Buy inventory over MCP</button>
          <pre id="result" aria-live="polite">The purchase result and receipt will appear here.</pre>
          <script>
          for (const button of document.querySelectorAll("button")) button.addEventListener("click",async()=>{
            const result=document.querySelector("#result");
            for (const b of document.querySelectorAll("button")) b.disabled=true;
            result.textContent="Submitting sandbox purchase…";
            try{
              const reply=await fetch("/staging/buyer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:button.dataset.kind})});
              result.textContent=JSON.stringify(await reply.json(),null,2);
            }catch{result.textContent="Could not read the purchase response."}
            finally{for(const b of document.querySelectorAll("button")) b.disabled=false}
          });
          </script></html>`);
      });
      app.post("/staging/buyer", async (req, res) => {
        if (!canBuy(req) || req.get("origin") !== origin) return res.status(403).json({ error: "Sign in to the staging seller account" });
        try {
          if (req.body?.kind === "http") {
            const response = await paidFetch(weather.connection!.http, init(wx));
            return res.status(response.status).json(await response.json());
          }
          if (req.body?.kind === "mcp") {
            const client = new Client({ name: "paygate402-staging-buyer", version: "1.0.0" });
            const wrapped = wrapMCPClientWithPayment(client, buyerPayment);
            try {
              await wrapped.connect(new StreamableHTTPClientTransport(new URL(inventory.connection!.mcp), { fetch: gatewayFetch }));
              const result = await wrapped.callTool("reserve_stock", stock);
              return res.json(JSON.parse((result.content[0] as { text: string }).text));
            } finally {
              await client.close();
            }
          }
          res.status(400).json({ error: "Choose an HTTP or MCP purchase" });
        } catch {
          res.status(503).json({ error: "Could not complete the sandbox purchase. Check whether the demo tool is published." });
        }
      });
    }
    app.use(express.static("dist/public")).use("*", (_req, res) => res.sendFile("dist/public/index.html", { root: process.cwd() }));
    ready = true;
    if (containerPreview) console.log(`Sandbox ready at ${origin}/auth`);
    else console.log(`Console: ${origin}/auth\nRequest a link for sandbox_seller@example.test, then open the link printed here.\nPress Ctrl+C to stop.`);
    await new Promise<void>(resolve => { process.once("SIGINT", () => resolve()); process.once("SIGTERM", () => resolve()); });
  }
} finally {
  for (const close of cleanup.reverse()) await close().catch(err => console.error("Sandbox cleanup:", err?.message));
}
