import { randomUUID } from "node:crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { decodePaymentSignatureHeader, encodePaymentRequiredHeader, encodePaymentResponseHeader } from "@x402/core/http";
import { z } from "zod";
import { money, operationInput, upstreamAuth, type SellerOperation } from "@shared/paygate";
import { apiKeyService } from "../services/api-key-service";
import { importOperation } from "./openapi";
import { randomIdPattern, requirements, type Payments } from "./payment";
import { Purchases } from "./purchases";
import { PaygateStore, type Operation, type Purchase } from "./store";
import { credentials, Problem, validateInput, type Upstream } from "./upstream";

type Async = (req: Request, res: Response) => Promise<unknown>;
function route(fn: Async) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set({ "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" });
    fn(req, res).catch(err => {
      if (res.headersSent) return next(err);
      if (err instanceof Problem) res.status(err.status).json({ error: err.message });
      else if (err instanceof z.ZodError) res.status(400).json({
        error: "Invalid configuration", fields: err.issues.map(i => ({ path: i.path.join("."), message: i.message })),
      });
      else {
        console.error("PayGate402 request failed", err?.name, err?.code);
        res.status(500).json({ error: "PayGate402 could not complete the request" });
      }
    });
  };
}
const configBody = z.object({ config: operationInput, auth: upstreamAuth.optional(), revision: z.number().int().positive().optional() }).strict();
const revBody = z.object({ revision: z.number().int().positive() }).strict();
const priceBody = revBody.extend({ price: money });
const lookupId = (id: string) => {
  if (!randomIdPattern.test(id)) throw new Problem(404, "Not found");
  return id;
};

export function registerPaygate(app: Express, options: {
  store: PaygateStore; identity: { getApiKeyByHash(hash: string): Promise<{ orgId: string; isActive: boolean; revokedAt: Date | null } | undefined> }; origin: string;
  upstream: Upstream; payments: Payments; key: Buffer;
}) {
  const { store, identity, origin, upstream, payments } = options;
  const secrets = credentials(options.key);
  const purchases = new Purchases(store, payments, upstream, secrets, origin);
  const seller = "/api/seller/v1/operations";
  const httpPath = "/x402/tools/:id";
  const purchasePath = "/x402/purchases/:id/:access";
  const mcpPath = "/mcp/:id";

  async function org(req: Request) {
    const token = req.get("authorization");
    if (token) {
      const key = /^Bearer (pk_live_[0-9a-f]{64})$/i.exec(token)?.[1];
      const entry = key && await identity.getApiKeyByHash(apiKeyService.hashKey(key));
      if (entry && entry.isActive && !entry.revokedAt) return entry.orgId;
      throw new Problem(401, "Invalid seller API key");
    }
    const user = req.user as { orgId?: string; role: string } | undefined;
    if (!user?.orgId || !req.isAuthenticated?.()) throw new Problem(401, "Sign in or use a seller API key");
    if (!["admin", "member"].includes(user.role)) throw new Problem(403, "Seller access required");
    if (!["GET", "HEAD"].includes(req.method)) {
      if (req.get("Origin") && req.get("Origin") !== origin) throw new Problem(403, "Invalid seller request origin");
      if (!req.is("application/json")) throw new Problem(415, "Use application/json");
    }
    return user.orgId;
  }
  async function owned(req: Request) {
    const orgId = await org(req);
    const op = await store.operation(lookupId(req.params.id));
    if (!op || op.org_id !== orgId) throw new Problem(404, "Operation not found");
    return op;
  }
  async function published(id: string) {
    const op = await store.operation(lookupId(id));
    if (!op || op.status !== "published") throw new Problem(404, "Operation not found");
    return op;
  }
  const links = (op: Operation) => ({
    http: origin + "/x402/tools/" + op.id, mcp: origin + "/mcp/" + op.id,
    tool: op.config.name, metadata: origin + "/x402/tools/" + op.id,
  });
  const sellerView = (op: Operation): SellerOperation => ({
    ...op.config, id: op.id, status: op.status, revision: op.revision,
    hasAuth: !!op.auth_cipher, tested: op.tested_revision === op.revision,
    ...(op.status === "published" ? { connection: links(op) } : {}),
  });
  function changed(op?: Operation) {
    if (!op) throw new Problem(409, "Operation changed; reload and try again");
    return sellerView(op);
  }
  function assertRevision(op: Operation, revision?: number) {
    if (op.revision !== revision) throw new Problem(409, "Operation changed; reload and try again");
  }
  app.get(seller, route(async (req, res) => res.json((await store.list(await org(req))).map(sellerView))));
  app.post(seller + "/import", route(async (req, res) => {
    await org(req);
    const { document, path, method } = z.object({
      document: z.record(z.unknown()), path: z.string().max(512), method: z.string().max(10),
    }).strict().parse(req.body);
    res.json(importOperation(document, path, method));
  }));
  app.post(seller, route(async (req, res) => {
    const orgId = await org(req);
    const { config, auth } = configBody.parse(req.body);
    await upstream.validate(config);
    const id = randomUUID();
    res.status(201).json(changed(await store.create(id, orgId, config, secrets.encrypt(auth ?? { type: "none" }, id))));
  }));
  app.get(seller + "/:id", route(async (req, res) => res.json(sellerView(await owned(req)))));
  app.put(seller + "/:id", route(async (req, res) => {
    const op = await owned(req);
    const { config, auth, revision } = configBody.parse(req.body);
    assertRevision(op, revision);
    await upstream.validate(config);
    if (op.auth_cipher && auth === undefined && new URL(config.url).origin !== new URL(op.config.url).origin) {
      throw new Problem(400, "Replace or remove credentials when changing upstream origin");
    }
    res.json(changed(await store.configure(op, config, auth === undefined ? op.auth_cipher : secrets.encrypt(auth, op.id))));
  }));
  app.post(seller + "/:id/test", route(async (req, res) => {
    const op = await owned(req);
    const body = revBody.extend({ input: z.record(z.unknown()) }).strict().parse(req.body);
    assertRevision(op, body.revision);
    const args = validateInput(op.config, body.input);
    let result;
    try { result = await upstream.call(op.config, secrets.decrypt(op.auth_cipher, op.id), args, randomUUID()); }
    catch (err) {
      if (err instanceof Problem) throw err;
      throw new Problem(502, "Sandbox call outcome unknown; check your upstream before trying again");
    }
    const ok = result.status >= 200 && result.status < 300;
    if (ok) changed(await store.tested(op));
    res.json({ ok, upstreamStatus: result.status, ...(ok ? { result: result.data } : {}) });
  }));
  for (const action of ["publish", "pause"] as const) {
    app.post(seller + "/:id/" + action, route(async (req, res) => {
      const op = await owned(req);
      assertRevision(op, revBody.parse(req.body).revision);
      if (action === "publish" && op.tested_revision !== op.revision) throw new Problem(409, "Run a successful sandbox call first");
      res.json(changed(await store.status(op, action === "publish" ? "published" : "paused")));
    }));
  }
  app.patch(seller + "/:id/price", route(async (req, res) => {
    const op = await owned(req);
    const { revision, price } = priceBody.parse(req.body);
    assertRevision(op, revision);
    res.json(changed(await store.price(op, price)));
  }));
  app.get(seller + "/:id/activity", route(async (req, res) => res.json(await store.activity(await owned(req)))));

  app.get(httpPath, route(async (req, res) => {
    const op = await published(req.params.id);
    const { name, description, inputSchema, price } = op.config;
    res.json({ name, description, inputSchema, price, currency: "USDC", payment: requirements(op.config), ...links(op) });
  }));
  function httpResult(res: Response, p: Purchase, status?: number) {
    res.set("PayGate-Purchase-Id", p.id);
    if (p.settlement) res.set("PAYMENT-RESPONSE", encodePaymentResponseHeader(p.settlement));
    const pending = ["paid", "settling", "fulfilling", "payment_unknown", "upstream_unknown", "retryable"].includes(p.state);
    if (pending) res.set("Retry-After", "2");
    // The gateway completed the purchase. Fulfillment failed at its upstream
    // dependency. Keep the receipt body visible through proxies that replace 502s.
    res.status(status ?? (p.state === "failed" ? 424 : pending ? 202 : 200)).json(purchases.view(p));
  }
  app.post(httpPath, route(async (req, res) => {
    if (!req.is("application/json")) throw new Problem(415, "Use application/json");
    const signature = req.get("PAYMENT-SIGNATURE");
    let payload;
    if (signature) {
      try { payload = decodePaymentSignatureHeader(signature); } catch { throw new Problem(400, "Invalid PAYMENT-SIGNATURE"); }
    }
    const outcome = signature
      ? await purchases.pay(lookupId(req.params.id), req.body, payload)
      : await purchases.quote(await published(req.params.id), req.body);
    if ("required" in outcome && outcome.required) {
      res.set("PAYMENT-REQUIRED", encodePaymentRequiredHeader(outcome.required));
      return httpResult(res, outcome.purchase, 402);
    }
    httpResult(res, outcome.purchase);
  }));
  async function findPurchase(req: Request) {
    return purchases.lookup(req.params.id, req.params.access);
  }
  app.get(purchasePath, route(async (req, res) => {
    httpResult(res, await store.stale(await findPurchase(req)), 200);
  }));
  app.post(purchasePath + "/resume", route(async (req, res) => {
    httpResult(res, (await purchases.recover(await findPurchase(req))).purchase);
  }));
  app.post(purchasePath + "/reconcile", route(async (req, res) => {
    httpResult(res, (await purchases.reconcile(await findPurchase(req))).purchase);
  }));
  app.use("/x402/purchases", (_req, res) => res.status(404).json({ error: "Purchase not found" }));

  // Stateless Streamable HTTP. Mount a separate MCP endpoint for each seller
  // operation so tool names need only be unique within that endpoint.
  app.post(mcpPath, route(async (req, res) => {
    if (req.get("Origin") && req.get("Origin") !== origin) throw new Problem(403, "Invalid MCP request origin");
    const id = lookupId(req.params.id);
    const op = await store.operation(id);
    const payment = req.body?.method === "tools/call" && req.body?.params?._meta?.["x402/payment"];
    if (!op || (op.status !== "published" && !payment)) throw new Problem(404, "Operation not found");
    const mcp = new Server({ name: "paygate402", version: "1.0.0" }, { capabilities: { tools: {} } });
    mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: op.status !== "published" ? [] : [{
        name: op.config.name,
        description: op.config.description + `\nPrice: ${op.config.price} USDC per call (Base Sepolia).`,
        inputSchema: op.config.inputSchema,
        annotations: { readOnlyHint: op.config.method === "GET", openWorldHint: true },
        _meta: { "paygate402/price": requirements(op.config) },
      }],
    }));
    mcp.setRequestHandler(CallToolRequestSchema, async ({ params }): Promise<CallToolResult> => {
      try {
        const args = params.arguments ?? {};
        const payment = params._meta?.["x402/payment"];
        if (!payment && (op.status !== "published" || params.name !== op.config.name)) throw new Problem(404, "Tool not found");
        const outcome = payment !== undefined
          ? await purchases.pay(id, args, payment, params.name)
          : await purchases.quote(op, args);
        if ("required" in outcome && outcome.required) {
          return { isError: true, structuredContent: { ...outcome.required }, content: [{ type: "text", text: JSON.stringify(outcome.required) }] };
        }
        const result = purchases.view(outcome.purchase);
        return {
          isError: outcome.purchase.state !== "succeeded",
          structuredContent: result, content: [{ type: "text", text: JSON.stringify(result) }],
          ...(outcome.purchase.settlement ? { _meta: { "x402/payment-response": outcome.purchase.settlement } } : {}),
        };
      } catch (err) {
        if (!(err instanceof Problem)) console.error("PayGate402 MCP request failed", (err as Error)?.name);
        return { isError: true, content: [{ type: "text", text: err instanceof Problem ? err.message : "PayGate402 could not complete the request" }] };
      }
    });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    // A dropped transport must not cancel a settlement or fulfillment already claimed.
    res.on("close", () => void mcp.close());
    await mcp.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }));
  app.all(mcpPath, route(async (req, res) => {
    await published(req.params.id);
    res.set("Allow", "POST").status(405).json({ error: "Use Streamable HTTP POST" });
  }));
}
