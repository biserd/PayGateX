import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { PaymentPayload, PaymentRequired, ResourceInfo, SettleResponse } from "@x402/core/types";
import { asset, challenge, network, randomIdPattern, requirements, same, type Payments } from "./payment";
import { PaygateStore, type Operation, type Purchase } from "./store";
import { credentials, Problem, validateInput, type Upstream } from "./upstream";

const addr = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
const authSchema = z.object({
  from: addr, to: addr, value: z.string().regex(/^\d{1,24}$/),
  validAfter: z.string().regex(/^\d{1,14}$/), validBefore: z.string().regex(/^\d{1,14}$/),
  nonce: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
}).strict();
const payloadSchema = z.object({
  x402Version: z.literal(2), resource: z.object({ url: z.string().max(2048) }).passthrough(),
  accepted: z.record(z.unknown()), payload: z.object({
    signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/), authorization: authSchema,
  }).strict(),
}).passthrough();
const accessPattern = /^[0-9a-f]{48}$/;
const accessHash = (access: string) => createHash("sha256").update(access).digest("hex");

export class Purchases {
  constructor(private store: PaygateStore, private payments: Payments, private upstream: Upstream,
    private secrets: ReturnType<typeof credentials>, private origin: string) {}

  private resultUrl(id: string, access: string) { return this.origin + "/x402/purchases/" + id + "/" + access; }

  async lookup(id: string, access: string) {
    if (!randomIdPattern.test(id) || !accessPattern.test(access)) throw new Problem(404, "Purchase not found");
    const p = await this.store.purchase(id);
    if (!p || !timingSafeEqual(Buffer.from(p.recovery_hash, "hex"), Buffer.from(accessHash(access), "hex"))) {
      throw new Problem(404, "Purchase not found");
    }
    return p;
  }

  async quote(op: Operation, input: unknown) {
    const id = randomUUID();
    const access = randomBytes(24).toString("hex");
    const args = validateInput(op.config, input);
    for (const mapping of op.config.mappings) {
      if (mapping.in !== "path") continue;
      const v = String(args[mapping.input]);
      if (!v || v === "." || v === ".." || /[%/\\]/.test(v) || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(v)) {
        throw new Problem(400, "Invalid path argument");
      }
    }
    // The v2 SDK copies resource.url into the signed retry envelope. This
    // per-call result URL carries the unguessable purchase ID across transports.
    const resource: ResourceInfo = {
      url: this.resultUrl(id, access), description: op.config.description, mimeType: "application/json",
    };
    const p = await this.store.quote(op, id, accessHash(access), args, resource, requirements(op.config));
    if (!p) throw new Problem(409, "The operation changed; request a new quote");
    return { purchase: p, required: challenge(p) };
  }

  async pay(operationId: string, input: unknown, envelope: unknown, toolName?: string): Promise<{ purchase: Purchase; required?: PaymentRequired }> {
    const parsed = payloadSchema.safeParse(envelope);
    if (!parsed.success) throw new Problem(400, "Expected a v2 exact EIP-3009 payment");
    const raw = parsed.data;
    const [id, access] = raw.resource.url.split("/").slice(-2);
    if (!id || !access || raw.resource.url !== this.resultUrl(id, access)) throw new Problem(400, "Invalid payment quote");
    const p = await this.lookup(id, access);
    if (p.operation_id !== operationId || (toolName !== undefined && toolName !== p.snapshot.name)) {
      throw new Problem(404, "Purchase not found");
    }
    const a = raw.payload.authorization;
    const key = [network, asset.toLowerCase(), a.from.toLowerCase(), a.nonce.toLowerCase()].join(":");
    if (!same(raw.resource, p.resource) || !same(raw.accepted, p.requirement) || !same(input, p.input)
      || a.to.toLowerCase() !== p.requirement.payTo.toLowerCase() || a.value !== p.requirement.amount) {
      throw new Problem(409, "Payment does not match this purchase");
    }
    if (p.state !== "quoted") {
      if (p.authorization_key !== key) throw new Problem(409, "Purchase already has a payment attempt; retrieve the existing purchase");
      return this.recover(p);
    }
    const op = await this.store.operation(operationId);
    if (!op || op.status !== "published" || op.revision !== p.operation_revision || new Date(p.expires_at).getTime() <= Date.now()) {
      throw new Problem(409, "Quote expired or changed; request a new quote");
    }
    const existing = await this.store.authorizationExists(key);
    if (existing) {
      if (existing.id === id) return this.recover((await this.store.purchase(id))!);
      throw new Problem(409, "Payment authorization has already been used");
    }
    // Normalize to exactly the validated v2 envelope before sending it to the
    // facilitator. This MVP does not pass client-declared extensions through.
    const payload: PaymentPayload = { x402Version: 2, resource: p.resource, accepted: p.requirement, payload: raw.payload };
    let verified;
    try { verified = await this.payments.verify(payload, p.requirement); }
    catch { throw new Problem(503, "Payment verification unavailable; no payment was taken"); }
    if (!verified.isValid || verified.payer?.toLowerCase() !== a.from.toLowerCase()) {
      // A parallel request may have settled while the facilitator was checking
      // this signature. Return its state instead of asking the buyer to repay.
      const latest = (await this.store.purchase(id))!;
      if (latest.authorization_key === key) return this.recover(latest);
      if (latest.state !== "quoted") throw new Problem(409, "Purchase already has a payment attempt");
      return { purchase: p, required: { ...challenge(p), error: "Payment authorization rejected" } };
    }
    const claimed = await this.store.claim(p, op, key, a);
    if (!claimed) {
      const latest = await this.store.purchase(id);
      if (latest?.authorization_key === key) return this.recover(latest);
      throw new Problem(409, "Payment already used, quote changed, or another payment is in progress");
    }
    let settlement: SettleResponse | undefined;
    try { settlement = await this.payments.settle(payload, p.requirement); }
    catch { /* A transport error can occur after broadcast. */ }
    if (!settlement || !this.confirmed(claimed, settlement)) {
      return { purchase: await this.store.transition(claimed, "payment_unknown") ?? (await this.store.purchase(id))! };
    }
    const paid = await this.store.transition(claimed, "paid", { settlement });
    return this.recover(paid ?? (await this.store.purchase(id))!);
  }

  private confirmed(p: Purchase, s: SettleResponse) {
    return s.success === true && /^0x[0-9a-fA-F]{64}$/.test(s.transaction) && s.network === network
      && s.payer?.toLowerCase() === p.evm_authorization?.from.toLowerCase();
  }

  // Called by both transports and explicit recovery. A committed payment can
  // be resumed after a crash before fulfillment started. A started upstream
  // call is never run again without reconciliation.
  async recover(purchase: Purchase): Promise<{ purchase: Purchase }> {
    const p = await this.store.stale(purchase);
    if (p.state !== "paid" && p.state !== "retryable") return { purchase: p };
    const claim = await this.store.transition(p, "fulfilling");
    if (!claim) return { purchase: (await this.store.purchase(p.id))! };
    const auth = this.secrets.decrypt(claim.auth_cipher, claim.operation_id);
    let response: Awaited<ReturnType<Upstream["call"]>>;
    try { response = await this.upstream.call(claim.snapshot, auth, claim.input, claim.id); }
    catch {
      return { purchase: await this.store.transition(claim, "upstream_unknown") ?? (await this.store.purchase(p.id))! };
    }
    const success = response.status >= 200 && response.status < 300;
    const ambiguous = (response.status === 408 || response.status >= 500) && claim.snapshot.method !== "GET";
    const next = success ? "succeeded" : ambiguous ? "upstream_unknown" : "failed";
    return { purchase: await this.store.transition(claim, next, {
      status: response.status, ...(success ? { result: response.data } : {}),
    }) ?? (await this.store.purchase(p.id))! };
  }

  async reconcile(purchase: Purchase) {
    const p = await this.store.stale(purchase);
    if (p.state === "payment_unknown") {
      let settlement;
      try { settlement = await this.payments.reconcile(p); } catch { throw new Problem(503, "Payment reconciliation unavailable"); }
      if (settlement && this.confirmed(p, settlement)) {
        return this.recover(await this.store.transition(p, "paid", { settlement }) ?? (await this.store.purchase(p.id))!);
      }
    }
    if (p.state === "upstream_unknown") {
      if (p.snapshot.method === "GET") {
        return { purchase: await this.store.transition(p, "retryable") ?? (await this.store.purchase(p.id))! };
      }
      const auth = this.secrets.decrypt(p.auth_cipher, p.operation_id);
      let status;
      try { status = await this.upstream.status(p.snapshot, auth, p.id); }
      catch (err) { if (err instanceof Problem) throw err; throw new Problem(503, "Upstream reconciliation unavailable"); }
      const evidence = z.discriminatedUnion("state", [
        z.object({ state: z.literal("succeeded"), result: z.unknown().refine(v => v !== undefined) }),
        z.object({ state: z.literal("not_executed") }),
        z.object({ state: z.literal("pending") }),
        z.object({ state: z.literal("failed") }),
      ]).safeParse(status.data);
      if (status.status !== 200 || !evidence.success) throw new Problem(502, "Upstream status did not confirm the purchase outcome");
      if (evidence.data.state === "succeeded") return { purchase: await this.store.transition(p, "succeeded", { result: evidence.data.result, status: 200 }) ?? (await this.store.purchase(p.id))! };
      if (evidence.data.state === "not_executed" || evidence.data.state === "failed") {
        const next = evidence.data.state === "failed" ? "failed" : "retryable";
        return { purchase: await this.store.transition(p, next) ?? (await this.store.purchase(p.id))! };
      }
    }
    return { purchase: p };
  }

  view(p: Purchase) {
    return {
      purchaseId: p.id, recoveryUrl: p.resource.url, state: p.state,
      ...(p.state === "succeeded" ? { result: p.result } : {}),
      upstreamStatus: p.upstream_status,
      receipt: p.settlement ? {
        purchaseId: p.id, amount: p.requirement.amount, price: p.snapshot.price,
        currency: "USDC", asset: p.requirement.asset, payTo: p.requirement.payTo,
        ...p.settlement,
      } : null,
    };
  }
}
