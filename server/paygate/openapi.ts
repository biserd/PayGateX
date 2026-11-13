import { Problem, object } from "./upstream";
import { method, type OperationInput } from "@shared/paygate";

const node = (v: unknown) => object(v) ? v : {};
const list = (v: unknown): unknown[] => Array.isArray(v) ? v : [];

// Import a single operation from supplied JSON. No network access or remote
// reference resolution. The draft can be edited before it is saved.
export function importOperation(document: unknown, path: string, verb: string) {
  const spec = node(document);
  const route = node(node(spec.paths)[path]);
  const op = node(route[verb.toLowerCase()]);
  const checkedMethod = method.safeParse(verb.toUpperCase());
  if (!/^3\.(0|1)\./.test(String(spec.openapi)) || !path.startsWith("/") || !checkedMethod.success || !Object.keys(op).length) {
    throw new Problem(400, "Choose an operation in an OpenAPI 3.0 or 3.1 JSON document");
  }
  const server = node(list(op.servers ?? route.servers ?? spec.servers)[0]).url;
  if (typeof server !== "string" || !/^https?:\/\//.test(server) || /[{}?#]/.test(server)) {
    throw new Problem(400, "The operation needs a concrete absolute servers URL");
  }
  const props: Record<string, unknown> = Object.create(null);
  const required: string[] = [];
  const mappings: OperationInput["mappings"] = [];
  const scalar = /^[A-Za-z_][A-Za-z0-9_-]{0,63}$/;
  function add(location: "path" | "query" | "body", name: string, schema: unknown, isRequired: boolean) {
    if (!scalar.test(name) || ["__proto__", "constructor", "prototype"].includes(name) || !object(schema) || "$ref" in schema) {
      throw new Problem(400, "Use named inline parameter and body schemas");
    }
    let input = name;
    if (Object.hasOwn(props, input)) input = location + "_" + name;
    if (Object.hasOwn(props, input) || !scalar.test(input)) throw new Problem(400, "Input names collide; configure the operation manually");
    props[input] = schema;
    if (isRequired) required.push(input);
    mappings.push({ input, in: location, name });
  }
  const parameters = new Map<string, Record<string, unknown>>();
  for (const raw of [...list(route.parameters), ...list(op.parameters)]) {
    const p = node(raw);
    if ((p.in !== "query" && p.in !== "path") || typeof p.name !== "string" || p.style !== undefined) {
      throw new Problem(400, "Import supports default path and query parameters; configure headers as upstream auth");
    }
    parameters.set(p.in + ":" + p.name, p);
  }
  for (const p of parameters.values()) add(p.in as "path" | "query", p.name as string, p.schema, p.in === "path" || p.required === true);
  if (op.requestBody !== undefined) {
    const body = node(op.requestBody);
    const schema = node(node(node(body.content)["application/json"]).schema);
    if (schema.type !== "object" || "$ref" in schema || !object(schema.properties)) throw new Problem(400, "Use an inline JSON object request body");
    if (body.required === false && list(schema.required).length) {
      throw new Problem(400, "Map optional request bodies with required fields manually");
    }
    for (const [k, v] of Object.entries(schema.properties)) add("body", k, v, list(schema.required).includes(k));
  }
  const rawName = String(op.operationId ?? checkedMethod.data.toLowerCase() + "_" + path).replace(/[^a-zA-Z0-9_-]/g, "_");
  return {
    name: (/^[a-zA-Z_]/.test(rawName) ? rawName : "_" + rawName).slice(0, 64),
    description: String(op.summary || op.description || checkedMethod.data + " " + path).slice(0, 1500),
    method: checkedMethod.data,
    url: server.replace(/\/+$/, "") + path,
    inputSchema: { type: "object", properties: props, required, additionalProperties: false },
    mappings,
  };
}
