import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Activity, OperationInput, SellerOperation, UpstreamAuth } from "@shared/paygate";

const api = "/api/seller/v1/operations";
const pretty = (x: unknown) => JSON.stringify(x, null, 2);
const empty: OperationInput = {
  name: "", description: "", url: "", method: "GET",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  mappings: [], price: "0.01", payTo: "",
};
const selectClass = "w-full rounded-md border bg-white p-2 text-sm";
async function send<T>(method: string, path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.fields?.length
    ? result.fields.map((f: { path: string; message: string }) => f.path + ": " + f.message).join("; ")
    : result.error || `Request failed (${response.status})`);
  return result;
}
const formatUsdc = (atomic: string) => {
  const s = atomic.padStart(7, "0");
  const cents = s.slice(-6).replace(/0+$/, "");
  return s.slice(0, -6) + (cents ? "." + cents : "");
};
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1 text-sm font-medium"><span>{label}</span>{children}</label>;
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-semibold">{title}</h2>{children}</section>;
}

export default function PaidTools() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, select] = useState<SellerOperation>();
  const [draft, setDraft] = useState(empty);
  const [schema, setSchema] = useState(pretty(empty.inputSchema));
  const [mappings, setMappings] = useState("[]");
  const [authType, setAuthType] = useState<"keep" | UpstreamAuth["type"]>("none");
  const [secret, setSecret] = useState("");
  const [header, setHeader] = useState("X-API-Key");
  const [sample, setSample] = useState("{}");
  const [test, setTest] = useState<unknown>();
  const [openapi, setOpenapi] = useState(false);
  const [document, setDocument] = useState("");
  const [path, setPath] = useState("");
  const [verb, setVerb] = useState("GET");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const operations = useQuery<SellerOperation[]>({ queryKey: [api] });
  const activity = useQuery<Activity>({
    queryKey: [`${api}/${selected?.id}/activity`], enabled: !!selected, refetchInterval: selected ? 5000 : false,
  });
  function set<K extends keyof OperationInput>(k: K, v: OperationInput[K]) {
    setDraft(current => ({ ...current, [k]: v }));
  }
  function load(op?: SellerOperation) {
    select(op);
    const d: OperationInput = op ? {
      name: op.name, description: op.description, url: op.url, method: op.method, inputSchema: op.inputSchema,
      mappings: op.mappings, price: op.price, payTo: op.payTo, statusUrl: op.statusUrl,
    } : empty;
    setDraft(d);
    setSchema(pretty(d.inputSchema));
    setMappings(pretty(d.mappings));
    setSecret("");
    setAuthType(op?.hasAuth ? "keep" : "none");
    setSample("{}");
    setTest(undefined);
    setError("");
    setStep(op?.tested ? 3 : op ? 2 : 1);
  }
  async function act(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try { await fn(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }
  async function refresh(op: SellerOperation) {
    select(op);
    await qc.invalidateQueries({ queryKey: [api] });
  }
  function save() {
    return act(async () => {
      const auth: UpstreamAuth | undefined = authType === "keep" ? undefined : authType === "none" ? { type: "none" }
        : authType === "bearer" ? { type: "bearer", value: secret } : { type: "header", header, value: secret };
      const config = { ...draft, statusUrl: draft.statusUrl || undefined, inputSchema: JSON.parse(schema), mappings: JSON.parse(mappings) };
      const op = await send<SellerOperation>(selected ? "PUT" : "POST", selected ? `${api}/${selected.id}` : api,
        { config, auth, revision: selected?.revision });
      setSecret("");
      setAuthType(op.hasAuth ? "keep" : "none");
      setTest(undefined);
      await refresh(op);
      setStep(2);
    });
  }
  function control(action: "publish" | "pause" | "price") {
    if (!selected) return;
    return act(async () => {
      await refresh(await send<SellerOperation>(action === "price" ? "PATCH" : "POST", `${api}/${selected.id}/${action}`, {
        revision: selected.revision, ...(action === "price" ? { price: draft.price } : {}),
      }));
    });
  }
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); toast({ title: "Copied" }); }
    catch { toast({ title: "Could not copy", description: "Select and copy the text directly." }); }
  }

  return <div className="flex min-h-screen bg-slate-50">
    <aside className="hidden lg:flex"><Sidebar /></aside>
    <main className="mx-auto w-full max-w-5xl min-w-0 space-y-5 p-4 md:p-8">
      <DashboardHeader title="Paid tools" description="Publish the API you already run as a paid HTTP endpoint and MCP tool." />
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Select an operation" className={selectClass + " max-w-sm"} value={selected?.id ?? ""}
          disabled={busy} onChange={e => load(operations.data?.find(op => op.id === e.target.value))}>
          <option value="">New operation</option>
          {operations.data?.map(op => <option key={op.id} value={op.id}>{op.name} · {op.status}</option>)}
        </select>
        {operations.isError && <span role="alert" className="text-sm text-red-700">Could not load operations.</span>}
        <a href="/api-keys" className="text-sm text-blue-700 underline">API keys for CI</a>
      </div>
      <nav aria-label="Setup steps" className="flex flex-wrap gap-2">
        {[["Connect and price", 1], ["Run a sandbox call", 2], ["Publish and monitor", 3]].map(([label, n]) =>
          <Button key={n} variant={step === n ? "default" : "outline"} disabled={busy || (n !== 1 && !selected)}
            onClick={() => setStep(Number(n))}>{n}. {label}</Button>)}
      </nav>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {step === 1 && <Panel title="1. Connect and price your API">
        <div className="flex gap-2">
          <Button variant={openapi ? "outline" : "secondary"} onClick={() => setOpenapi(false)}>Enter manually</Button>
          <Button variant={openapi ? "secondary" : "outline"} onClick={() => setOpenapi(true)}>Import OpenAPI JSON</Button>
        </div>
        {openapi && <div className="space-y-3 rounded-lg bg-slate-50 p-3">
          <Field label="OpenAPI 3 JSON"><Textarea rows={6} value={document} onChange={e => setDocument(e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Operation path"><Input placeholder="/items/{id}" value={path} onChange={e => setPath(e.target.value)} /></Field>
            <Field label="HTTP method"><select className={selectClass} value={verb} onChange={e => setVerb(e.target.value)}>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m}>{m}</option>)}</select></Field>
          </div>
          <Button variant="outline" disabled={busy} onClick={() => void act(async () => {
            const imported = await send<Omit<OperationInput, "price" | "payTo">>("POST", api + "/import", { document: JSON.parse(document), path, method: verb });
            setDraft({ ...draft, ...imported });
            setSchema(pretty(imported.inputSchema));
            setMappings(pretty(imported.mappings));
            setOpenapi(false);
          })}>Load operation</Button>
        </div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tool name"><Input value={draft.name} onChange={e => set("name", e.target.value)} placeholder="weather_forecast" /></Field>
          <Field label="Upstream method"><select className={selectClass} value={draft.method} onChange={e => set("method", e.target.value as OperationInput["method"])}>
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m}>{m}</option>)}</select></Field>
          <Field label="Upstream URL"><Input value={draft.url} onChange={e => set("url", e.target.value)} placeholder="https://api.example.com/forecast" /></Field>
          <Field label="Outcome status URL (optional)"><Input value={draft.statusUrl ?? ""} onChange={e => set("statusUrl", e.target.value)} placeholder="https://api.example.com/call-status" /></Field>
        </div>
        <Field label="Buyer-facing description"><Textarea value={draft.description} onChange={e => set("description", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Typed inputs (JSON Schema)"><Textarea className="font-mono" rows={7} value={schema} onChange={e => setSchema(e.target.value)} /></Field>
          <Field label="Input mappings (JSON)"><Textarea className="font-mono" rows={7} value={mappings} onChange={e => setMappings(e.target.value)} />
            <span className="block text-xs text-slate-600">Example: {pretty([{ input: "city", in: "query", name: "q" }]).replace(/\s+/g, " ")}</span></Field>
          <Field label="Upstream authentication"><select className={selectClass} value={authType} onChange={e => { setAuthType(e.target.value as typeof authType); setSecret(""); }}>
            {selected?.hasAuth && <option value="keep">Keep saved credential</option>}
            <option value="none">None</option><option value="bearer">Bearer token</option><option value="header">API key header</option>
          </select></Field>
          {authType === "header" && <Field label="Header name"><Input value={header} onChange={e => setHeader(e.target.value)} /></Field>}
          {(authType === "header" || authType === "bearer") && <Field label="Credential value"><Input type="password" autoComplete="new-password" value={secret} onChange={e => setSecret(e.target.value)} /></Field>}
          <Field label="Price per call (USDC)"><Input inputMode="decimal" value={draft.price} onChange={e => set("price", e.target.value)} /></Field>
          <Field label="Payout wallet (Base Sepolia)"><Input value={draft.payTo} onChange={e => set("payTo", e.target.value)} placeholder="0x…" /></Field>
        </div>
        <Button disabled={busy} onClick={() => void save()}>Save draft</Button>
        {selected?.status === "published" && <p className="text-sm text-slate-600">Saving a new configuration unpublishes this operation until the new configuration passes a sandbox call.</p>}
      </Panel>}
      {step === 2 && selected && <Panel title="2. Test the upstream">
        <p className="text-sm text-slate-600">This makes a real request to your configured upstream and skips payment. Use test data for operations that change records.</p>
        <Field label="Sample arguments (JSON)"><Textarea className="font-mono" rows={6} value={sample} onChange={e => setSample(e.target.value)} /></Field>
        <Button disabled={busy} onClick={() => void act(async () => {
          const result = await send<{ ok: boolean }>("POST", `${api}/${selected.id}/test`, { revision: selected.revision, input: JSON.parse(sample) });
          setTest(result);
          if (result.ok) await refresh({ ...selected, tested: true });
        })}>Run sandbox call</Button>
        {selected.tested && <Button className="ml-2" variant="outline" onClick={() => setStep(3)}>Continue to publish</Button>}
        {test !== undefined && <pre className="max-h-56 overflow-auto rounded-lg bg-slate-100 p-3 text-xs">{pretty(test)}</pre>}
      </Panel>}
      {step === 3 && selected && <>
        <Panel title="3. Publish and connect">
          <p className="text-sm text-slate-600">Status: <strong>{selected.status}</strong> · {selected.price} USDC per call</p>
          {selected.status === "published"
            ? <Button disabled={busy} variant="outline" onClick={() => void control("pause")}>Pause tool</Button>
            : <Button disabled={busy || !selected.tested} onClick={() => void control("publish")}>Publish tool</Button>}
          {selected.connection && <div className="space-y-3">
            {([["HTTP endpoint (POST)", selected.connection.http], ["MCP server and tool", pretty({
              url: selected.connection.mcp, tool: selected.connection.tool,
            })]] as const).map(([label, value]) => <div key={label}>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">{label}</span>
                <Button variant="ghost" size="sm" onClick={() => void copy(value)}>Copy</Button></div>
              <pre className="overflow-auto rounded-md bg-slate-100 p-3 text-xs">{value}</pre>
            </div>)}
          </div>}
          <div className="flex flex-wrap items-end gap-2">
            <Field label="New price (USDC)"><Input inputMode="decimal" value={draft.price} onChange={e => set("price", e.target.value)} /></Field>
            <Button variant="outline" disabled={busy} onClick={() => void control("price")}>Update price</Button>
          </div>
        </Panel>
        <Panel title="Recent activity">
          {activity.isError ? <p>Could not load activity.</p> : !activity.data ? <p>Loading activity…</p> : <>
            <p className="text-sm text-slate-600">{activity.data.calls} calls · {formatUsdc(activity.data.revenueAtomic)} USDC settled · {activity.data.failures} failed or unknown</p>
            {activity.data.recent.length ? <div className="overflow-x-auto">
              <table className="w-full text-left text-sm"><thead><tr><th>Time</th><th>Purchase</th><th>State</th><th>Settled</th><th>Upstream</th></tr></thead>
                <tbody>{activity.data.recent.map(row => <tr key={row.id} className="border-t">
                  <td className="py-2">{new Date(row.createdAt).toLocaleString()}</td><td title={row.id}>{row.id.slice(0, 8)}</td>
                  <td>{row.state.replace(/_/g, " ")}</td><td>{row.amount ? formatUsdc(row.amount) + " USDC" : "—"}</td><td>{row.upstreamStatus ?? "—"}</td>
                </tr>)}</tbody></table>
            </div> : <p className="text-sm text-slate-600">Paid attempts will appear here.</p>}
          </>}
        </Panel>
      </>}
    </main>
  </div>;
}
