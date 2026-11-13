import { lookup } from "node:dns/promises";
import { request as https } from "node:https";
import { request as http } from "node:http";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import ipaddr from "ipaddr.js";
import Ajv from "ajv";
import type { OperationInput, UpstreamAuth } from "@shared/paygate";

export class Problem extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export type Input = Record<string, unknown>;
export const object = (v: unknown): v is Input => !!v && typeof v === "object" && !Array.isArray(v);
const field = /^[A-Za-z_][A-Za-z0-9_-]{0,63}$/;
const placeholder = /\{([A-Za-z_][A-Za-z0-9_-]*)\}/g;
const schemaTypes = new Set(["string", "number", "integer", "boolean", "object", "array", "null"]);
const ajv = new Ajv({ strict: true, ownProperties: true, addUsedSchema: false });
const validators = new Map<string, ReturnType<typeof ajv.compile>>();

// Inline, bounded schemas only. In particular do not evaluate seller-supplied regexes or remote refs.
function inspectSchema(value: unknown, depth = 0, budget = { remaining: 160 }) {
  if (!object(value) || depth > 8 || --budget.remaining < 0 || !schemaTypes.has(String(value.type))
    || Object.keys(value).some(k => !["type", "description", "properties", "required", "additionalProperties",
      "items", "enum", "minimum", "maximum", "minLength", "maxLength", "minItems", "maxItems"].includes(k))) {
    throw new Problem(400, "Use inline typed JSON Schema without references or patterns");
  }
  if (value.properties !== undefined) {
    if (!object(value.properties)) throw new Problem(400, "Invalid schema properties");
    for (const [k, v] of Object.entries(value.properties)) {
      if (!field.test(k) || ["__proto__", "prototype", "constructor"].includes(k)) throw new Problem(400, "Invalid schema field");
      inspectSchema(v, depth + 1, budget);
    }
  }
  if (value.items !== undefined) inspectSchema(value.items, depth + 1, budget);
  if (value.additionalProperties !== undefined && value.additionalProperties !== false) throw new Problem(400, "additionalProperties must be false");
  if (value.enum !== undefined && (!Array.isArray(value.enum) || value.enum.length > 50 ||
      value.enum.some(v => v !== null && !["string", "number", "boolean"].includes(typeof v)))) {
    throw new Problem(400, "Use a scalar enum with at most 50 values");
  }
}
function validator(schema: OperationInput["inputSchema"]) {
  const key = JSON.stringify(schema);
  let validate = validators.get(key);
  if (!validate) {
    if (key.length > 24000) throw new Problem(400, "Input schema is too large");
    inspectSchema(schema);
    try { validate = ajv.compile(schema); } catch { throw new Problem(400, "Invalid input schema"); }
    if (validators.size >= 128) validators.delete(validators.keys().next().value!);
    validators.set(key, validate);
  }
  return validate;
}
export function validateInput(config: OperationInput, value: unknown): Input {
  if (!object(value) || !validator(config.inputSchema)(value)) throw new Problem(400, "Arguments do not match the input schema");
  return value;
}

function endpoint(template: string, allowed: ReadonlySet<string>) {
  let url: URL;
  try { url = new URL(template.replace(placeholder, "paygate-field")); }
  catch { throw new Problem(400, "Use an absolute upstream URL"); }
  // Templates are restricted to the path. Credentials are supplied separately.
  const authority = /^https?:\/\/([^/?#]+)/.exec(template)?.[1];
  if (!authority || /[{}\\\s]/.test(authority) || /[\\\s]/.test(template) || /[{}]/.test(template.replace(placeholder, ""))
    || url.search || url.hash || url.username || url.password ||
    (url.protocol !== "https:" && !allowed.has(url.origin)) ||
    (url.port && !allowed.has(url.origin))) throw new Problem(400, "Use HTTPS without credentials, a custom port, query, or fragment");
  return url;
}
const hostname = (url: URL) => url.hostname.replace(/^\[|\]$/g, "");
export function publicIp(value: string) {
  try {
    const address = ipaddr.process(value);
    if (address.range() !== "unicast") return false;
    if (address instanceof ipaddr.IPv6) return address.match(ipaddr.IPv6.parse("2000::"), 3);
    // Azure's platform virtual IP is publicly numbered but locally routed.
    return address.toString() !== "168.63.129.16";
  } catch { return false; }
}
async function resolve(url: URL, allowed: ReadonlySet<string>) {
  const host = hostname(url);
  if (allowed.has(url.origin) && host === "127.0.0.1") return { address: host, family: 4 };
  if (ipaddr.isValid(host)) {
    if (!publicIp(host)) throw new Problem(400, "Upstream address is not public");
    return { address: host, family: host.includes(":") ? 6 : 4 };
  }
  if (!host.includes(".") || /(?:^|\.)(localhost|local|internal|test|invalid|onion)\.?$/i.test(host)) {
    throw new Problem(400, "Upstream hostname is not public");
  }
  let addresses: { address: string; family: number }[];
  try { addresses = await lookup(host, { all: true, verbatim: true }); }
  catch { throw new Problem(400, "Could not resolve the upstream hostname"); }
  if (!addresses.length || addresses.some(a => !publicIp(a.address))) throw new Problem(400, "Upstream address is not public");
  return addresses[0];
}

export function upstreamPolicy(allowed: ReadonlySet<string> = new Set(), timeoutMs = 10_000) {
  async function validate(config: OperationInput) {
    const url = endpoint(config.url, allowed);
    validator(config.inputSchema);
    const targets = new Set<string>();
    const sources = new Set<string>();
    const tokens = new Set(Array.from(config.url.matchAll(placeholder), m => m[1]));
    for (const m of config.mappings) {
      const type = (config.inputSchema.properties[m.input] as Input | undefined)?.type;
      const target = m.in + ":" + m.name;
      if (!type || targets.has(target) || (m.in === "body" && config.method === "GET")
        || (m.in !== "body" && !["string", "number", "integer", "boolean"].includes(String(type)))
        || (m.in === "path" && (!tokens.delete(m.name) || !config.inputSchema.required?.includes(m.input)))) {
        throw new Problem(400, "Check input mappings and required path parameters");
      }
      targets.add(target);
      sources.add(m.input);
    }
    if (tokens.size || Object.keys(config.inputSchema.properties).some(k => !sources.has(k))) {
      throw new Problem(400, "Map every input and path placeholder");
    }
    if (config.statusUrl) {
      const status = endpoint(config.statusUrl, allowed);
      if (status.origin !== url.origin || /[{}]/.test(config.statusUrl)) throw new Problem(400, "Status URL must use the upstream origin without placeholders");
    }
    await resolve(url, allowed);
  }

  async function send(url: URL, method: string, auth: UpstreamAuth, purchaseId: string, body?: string) {
    const pinned = await resolve(url, allowed);
    const headers: Record<string, string> = { accept: "application/json", "idempotency-key": purchaseId };
    if (body !== undefined) {
      headers["content-type"] = "application/json";
      headers["content-length"] = String(Buffer.byteLength(body));
    }
    if (auth.type === "bearer") headers.authorization = "Bearer " + auth.value;
    if (auth.type === "header") headers[auth.header.toLowerCase()] = auth.value;
    return new Promise<{ status: number; data: unknown }>((ok, fail) => {
      const transport = url.protocol === "https:" ? https : http;
      const signal = AbortSignal.timeout(timeoutMs);
      const req = transport(url, {
        method, headers, signal, agent: false, family: pinned.family,
        lookup: (_host, options, callback) => {
          if (options.all) (callback as unknown as (error: null, results: typeof pinned[]) => void)(null, [pinned]);
          else callback(null, pinned.address, pinned.family);
        },
      }, res => {
        const status = res.statusCode ?? 502;
        if (status < 200 || status >= 300) {
          res.destroy();
          ok({ status, data: null });
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (b: Buffer) => {
          size += b.length;
          if (size > 512_000) req.destroy(new Error("response_too_large"));
          else chunks.push(b);
        });
        res.on("error", fail);
        res.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const data: unknown = raw ? JSON.parse(raw) : null;
            if (auth.type !== "none") {
              const secret = auth.value;
              const contains = (v: unknown): boolean => typeof v === "string" ? v.includes(secret)
                : Array.isArray(v) ? v.some(contains) : object(v)
                  ? Object.entries(v).some(([k, item]) => k.includes(secret) || contains(item)) : false;
              if (contains(data)) throw new Error("credential_in_response");
            }
            ok({ status, data });
          } catch { fail(new Error("invalid_upstream_response")); }
        });
      });
      req.on("error", fail);
      req.end(body);
    });
  }
  async function call(config: OperationInput, auth: UpstreamAuth, args: Input, id: string) {
    const paths = new Map(config.mappings.filter(m => m.in === "path").map(m => [m.name, m.input]));
    const url = endpoint(config.url, allowed);
    const pathname = config.url.match(/^https?:\/\/[^/]+(\/.*)$/)?.[1] ?? "/";
    url.pathname = pathname.replace(placeholder, (_match, name: string) => {
      const value = String(args[paths.get(name)!]);
      if (!value || value === "." || value === ".." || /[%/\\]/.test(value)) {
        throw new Problem(400, "Path input cannot be empty or contain separators");
      }
      return encodeURIComponent(value);
    });
    const body: Input = Object.create(null);
    for (const m of config.mappings) {
      if (!Object.hasOwn(args, m.input)) continue;
      if (m.in === "query") url.searchParams.set(m.name, String(args[m.input]));
      if (m.in === "body") body[m.name] = args[m.input];
    }
    return send(url, config.method, auth, id,
      Object.keys(body).length ? JSON.stringify(body) : undefined);
  }
  return {
    validate, call,
    status: (config: OperationInput, auth: UpstreamAuth, id: string) => {
      if (!config.statusUrl) throw new Problem(409, "No upstream status endpoint is configured");
      const url = endpoint(config.statusUrl, allowed);
      if (url.origin !== endpoint(config.url, allowed).origin) throw new Problem(409, "Invalid upstream status origin");
      url.searchParams.set("purchaseId", id);
      return send(url, "GET", auth, id);
    },
  };
}
export type Upstream = ReturnType<typeof upstreamPolicy>;

export function credentials(key: Buffer) {
  if (key.length !== 32) throw new Error("PAYGATE_SECRET_KEY must be 32 bytes encoded as hex");
  return {
    encrypt(auth: UpstreamAuth, operationId: string) {
      if (auth.type === "none") return null;
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      cipher.setAAD(Buffer.from(operationId));
      const ciphertext = Buffer.concat([cipher.update(JSON.stringify(auth)), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
    },
    decrypt(value: string | null, operationId: string): UpstreamAuth {
      if (!value) return { type: "none" };
      const data = Buffer.from(value, "base64");
      const decipher = createDecipheriv("aes-256-gcm", key, data.subarray(0, 12));
      decipher.setAAD(Buffer.from(operationId));
      decipher.setAuthTag(data.subarray(12, 28));
      return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8"));
    },
  };
}
