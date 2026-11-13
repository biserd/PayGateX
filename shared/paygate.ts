import { z } from "zod";

const name = /^[A-Za-z_][A-Za-z0-9_-]{0,63}$/;
const safeKey = (s: string) => name.test(s) && !["__proto__", "constructor", "prototype"].includes(s);
const key = z.string().refine(safeKey, "Use a valid field name");
export const money = z.string().regex(/^\d{1,9}(\.\d{1,6})?$/, "Use a USDC amount with up to six decimals")
  .refine(s => Number(s) > 0, "Price must be positive");
export const wallet = z.string().regex(/^0x[0-9a-fA-F]{40}$/).refine(s => !/^0x0{40}$/.test(s), "Use a nonzero EVM address");
export const method = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const schemaNode = z.object({
  type: z.literal("object"), properties: z.record(z.unknown()).default({}),
  required: z.array(key).optional(), additionalProperties: z.literal(false).default(false),
}).strict().superRefine((v, ctx) => {
  if (Object.keys(v.properties).length > 50 || Object.keys(v.properties).some(k => !safeKey(k))
      || v.required?.some(k => !Object.hasOwn(v.properties, k))) {
    ctx.addIssue({ code: "custom", message: "Invalid input fields or required list" });
  }
});
export const operationInput = z.object({
  name: key,
  description: z.string().trim().min(1).max(1500),
  url: z.string().max(2048),
  method,
  inputSchema: schemaNode,
  mappings: z.array(z.object({
    input: key, in: z.enum(["path", "query", "body"]), name: key,
  }).strict()).max(50),
  price: money,
  payTo: wallet,
  statusUrl: z.string().max(2048).optional(),
}).strict();
export const upstreamAuth = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }).strict(),
  z.object({ type: z.literal("bearer"), value: z.string().regex(/^[\x21-\x7e]{1,4096}$/) }).strict(),
  z.object({
    type: z.literal("header"),
    header: z.string().regex(/^x-[A-Za-z0-9-]{1,60}$/i),
    value: z.string().regex(/^[\x20-\x7e]{1,4096}$/),
  }).strict(),
]);
export type OperationInput = z.infer<typeof operationInput>;
export type UpstreamAuth = z.infer<typeof upstreamAuth>;
export type OperationStatus = "draft" | "published" | "paused";
export type SellerOperation = OperationInput & {
  id: string; status: OperationStatus; hasAuth: boolean; tested: boolean; revision: number;
  connection?: { http: string; mcp: string; tool: string; metadata: string };
};
export type PurchaseState = "quoted" | "settling" | "payment_unknown" |
  "paid" | "fulfilling" | "succeeded" | "failed" | "upstream_unknown" | "retryable";
export type Activity = {
  calls: number; failures: number; revenueAtomic: string;
  recent: { id: string; state: PurchaseState; createdAt: string; amount: string | null; upstreamStatus: number | null }[];
};
