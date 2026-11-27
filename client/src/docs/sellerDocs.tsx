import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DocSection } from "./docsData";

const linkStyle = "font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900";

const exampleOperation = JSON.stringify({
  config: {
    name: "weather_forecast",
    description: "Find a forecast by city",
    url: "https://weather.example.com/forecast/{city}",
    method: "GET",
    price: "0.02",
    payTo: "0x1111111111111111111111111111111111111111",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { city: { type: "string" }, days: { type: "integer", minimum: 1 } },
      required: ["city", "days"],
    },
    mappings: [
      { input: "city", in: "path", name: "city" },
      { input: "days", in: "query", name: "days" },
    ],
  },
}, null, 2);

const publishExample = [
  "set -eu",
  'api="https://paygate402.com/api/seller/v1/operations"',
  "",
  "seller_request() {",
  '  curl --silent --show-error --fail-with-body \\',
  '    -H "Authorization: Bearer $SELLER_KEY" \\',
  "    -H 'Content-Type: application/json' \\",
  '    "$@"',
  "}",
  "",
  'draft=$(seller_request "$api" --data-binary @operation.json)',
  'id=$(printf "%s" "$draft" | jq -er .id)',
  'revision=$(printf "%s" "$draft" | jq -er .revision)',
  "",
  "test_body=$(jq -n --argjson revision \"$revision\" '{revision: $revision, input: {city: \"Sofia\", days: 2}}')",
  'test_result=$(seller_request "$api/$id/test" --data "$test_body")',
  'printf "%s" "$test_result" | jq -e ".ok == true"',
  "",
  "publish_body=$(jq -n --argjson revision \"$revision\" '{revision: $revision}')",
  'published=$(seller_request "$api/$id/publish" --data "$publish_body")',
  'printf "%s" "$published" | jq "{id, revision, connection}"',
].join("\n");

function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-24 space-y-3">
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function Example({ label, code }: { label: string; code: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-slate-100">
      <figcaption className="border-b border-slate-700 px-4 py-2 text-sm font-medium">{label}</figcaption>
      <pre aria-label={label} tabIndex={0} className="overflow-x-auto p-4 text-sm leading-6"><code>{code}</code></pre>
    </figure>
  );
}

function ReferenceTable({ columns, rows }: { columns: [string, string]; rows: [string, ReactNode][] }) {
  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          {columns.map(column => <TableHead key={column} scope="col">{column}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([name, detail]) => (
          <TableRow key={name}>
            <TableCell className="min-w-36 align-top font-medium text-slate-950"><code>{name}</code></TableCell>
            <TableCell className="align-top leading-relaxed">{detail}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SellerApiGuide() {
  return (
    <div className="space-y-9 leading-relaxed text-slate-700">
      <GuideSection id="get-an-api-key" title="Get an API key">
        <p><a className={linkStyle} href="/auth">Sign in with your email</a>, then create a key under <a className={linkStyle} href="/api-keys">Dashboard → API keys</a>. Save the key when it appears and store it as <code>SELLER_KEY</code> in your CI secret store. You can revoke it from the same page.</p>
        <p>Send <code>Authorization: Bearer $SELLER_KEY</code> with each automation request and <code>Content-Type: application/json</code> for JSON bodies. A key can change operations, prices, and payout addresses in its workspace. The Dashboard uses the same API with your sign-in session.</p>
      </GuideSection>

      <GuideSection id="configure-an-operation" title="Configure an operation">
        <p>Enter an operation manually or send an OpenAPI 3.0 or 3.1 JSON <code>document</code>, <code>path</code>, and <code>method</code> to <code>POST /import</code>. The import returns an editable draft configuration. Add your price, payout address, and any upstream credentials before creating the draft. The importer supports inline path and query parameters and inline JSON object request bodies. It reads the document you provide and leaves reference resolution to you.</p>
        <p>Use a public HTTPS endpoint on port 443. Map each typed input to a path, query, or JSON body field. Use query mappings for query parameters and keep them out of the endpoint URL. Path inputs must be required, and GET operations cannot have body mappings. The per-call price is a positive USDC string with up to six decimal places. Use a nonzero EVM wallet address you control for payouts on Base Sepolia.</p>
        <p>The API accepts <code>auth</code> with <code>type</code> set to <code>none</code>, <code>bearer</code> with a <code>value</code>, or <code>header</code> with an <code>x-*</code> header name and <code>value</code>. For an API key header, inject an object such as <code>{'{ "type": "header", "header": "X-API-Key", "value": "..." }'}</code> from your CI secret store at runtime. PayGate402 encrypts credentials server-side and returns only <code>hasAuth</code>.</p>
      </GuideSection>

      <GuideSection id="test-and-publish" title="Test and publish from CI">
        <p>Save this example as <code>operation.json</code> and replace the upstream URL and payout address. Adjust the test arguments to match your API. The sandbox test calls your actual upstream without payment. Use a test upstream or safe inputs for any operation that can change data.</p>
        <Example label="operation.json" code={exampleOperation} />
        <p>With <code>curl</code>, <code>jq</code>, and <code>SELLER_KEY</code> available, create the draft, confirm its sandbox test passed, and publish it. The publish response includes the HTTP URL, MCP URL, and MCP tool name in <code>connection</code>.</p>
        <Example label="Create, test, and publish" code={publishExample} />
      </GuideSection>

      <GuideSection id="endpoint-reference" title="Endpoint reference">
        <p>Paths below are relative to <code className="break-all">https://paygate402.com/api/seller/v1/operations</code>. Use the latest integer <code>revision</code> with every write to an existing operation. After HTTP 409, fetch the operation again and review its current configuration before retrying.</p>
        <ReferenceTable columns={["Method and path", "Request and result"]} rows={[
          ["GET /", "List the workspace’s operations."],
          ["POST /import", <><code>{'{document, path, method}'}</code> returns partial configuration for one OpenAPI operation.</>],
          ["POST /", <><code>{'{config, auth?}'}</code> creates a draft and returns its ID and revision.</>],
          ["GET /:id", <>Read configuration, status, current revision, and <code>hasAuth</code>.</>],
          ["PUT /:id", <><code>{'{config, revision, auth?}'}</code> replaces the configuration and returns the operation to draft. Omit <code>auth</code> to keep credentials on the same upstream origin, or set <code>{'{type: "none"}'}</code> to remove them.</>],
          ["POST /:id/test", <><code>{'{revision, input}'}</code> runs an unpaid upstream call and returns <code>ok</code>, <code>upstreamStatus</code>, and the successful result when available.</>],
          ["POST /:id/publish", <><code>{'{revision}'}</code> publishes a tested revision and returns connection details.</>],
          ["PATCH /:id/price", <><code>{'{revision, price}'}</code> updates the per-call price while retaining an existing successful test.</>],
          ["POST /:id/pause", <><code>{'{revision}'}</code> removes the operation from discovery and stops new purchases. Customers can still retrieve results and receipts for settled purchases.</>],
          ["GET /:id/activity", <>Read call and failure counts, the latest 30 attempts, and settled revenue in <code>revenueAtomic</code>. One USDC equals 1,000,000 atomic units.</>],
        ]} />
        <p>Share the published links with your customers so they can <a href="/docs/seller/buyer-payments" className={linkStyle}>check the price, pay, and recover results</a>.</p>
      </GuideSection>
    </div>
  );
}

function BuyerPaymentsGuide() {
  return (
    <div className="space-y-9 leading-relaxed text-slate-700">
      <GuideSection id="pay-for-a-call" title="Preview and pay for a call">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Open the published HTTP URL with <code>GET</code> to view its input schema, price, network, and payout address. Over MCP, use <code>tools/list</code> to view the tool, schema, and price.</li>
          <li>Send the input as JSON to the HTTP URL with <code>POST</code>, or send the arguments with MCP <code>tools/call</code>. The HTTP response has status <code>402</code> and a <code>PAYMENT-REQUIRED</code> header. MCP returns the x402 challenge in the tool result.</li>
          <li>Save the challenge’s <code>resource.url</code> before retrying. This private recovery URL includes a purchase ID and a recovery credential. Keep it out of logs and shared messages.</li>
          <li>Use an x402 v2 payment-aware client funded with Base Sepolia USDC. HTTP retries send <code>PAYMENT-SIGNATURE</code> and MCP retries use <code>_meta["x402/payment"]</code>. The paid response includes settlement as <code>PAYMENT-RESPONSE</code> or <code>_meta["x402/payment-response"]</code>, plus the purchase ID, state, receipt, and any available result.</li>
        </ol>
      </GuideSection>

      <GuideSection id="recover-a-purchase" title="Recover a purchase">
        <p>If you disconnect, read the private recovery URL with <code>GET</code> to retrieve the result and receipt. You can also repeat the original request with the same payment and arguments. A new unsigned call creates a new quote. Quotes expire after five minutes or when the seller changes the operation’s revision or pauses it.</p>
        <ReferenceTable columns={["Purchase state", "Next step"]} rows={[
          ["settling, fulfilling", "Poll the recovery URL."],
          ["paid, retryable", <>Send <code>POST</code> to the recovery URL with <code>/resume</code> appended to continue without paying again.</>],
          ["upstream_unknown", <>Send <code>POST</code> to the recovery URL with <code>/reconcile</code> appended. A mutating operation needs a confirmed outcome before it can retry.</>],
          ["payment_unknown", <>Send <code>POST</code> to the recovery URL with <code>/reconcile</code> appended to look for the exact transfer on-chain without rebroadcasting it.</>],
          ["succeeded, failed", "Read the stored result or failure and its receipt. A terminal upstream failure on a paid call returns HTTP 424 and keeps the receipt."],
        ]} />
        <p>Sellers can add a same-origin <code>statusUrl</code> for a mutating operation. PayGate402 sends <code>Idempotency-Key</code> with the purchase ID to the upstream and looks up the outcome with <code>?purchaseId=</code>. Return a JSON state of <code>succeeded</code> with a <code>result</code>, <code>failed</code>, <code>pending</code>, or <code>not_executed</code>. Return <code>not_executed</code> only when the original request can no longer commit.</p>
      </GuideSection>

      <GuideSection id="client-compatibility" title="Client compatibility">
        <p>Sandbox purchases were verified with <code>@x402/fetch</code> 2.31.0 over HTTP and <code>@x402/mcp</code> 2.31.0 with <code>@modelcontextprotocol/sdk</code> 1.32.2 over Streamable HTTP. An ordinary MCP client can discover the tool. A payment-aware client is required to sign the challenge and complete the purchase.</p>
        <p>The hosted release supports x402 v2 exact payments with Base Sepolia testnet USDC. Mainnet payments and automatic refunds are unavailable. ChatGPT plugin payment compatibility is unverified.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="/directory" className={linkStyle}>Browse published tools</a>
          <a href="/docs/seller/api" className={linkStyle}>Automate API setup</a>
        </div>
      </GuideSection>
    </div>
  );
}

export const sellerDocs: DocSection = {
  title: "API setup and payments",
  slug: "seller",
  description: "Automate operations, publish HTTP and MCP tools, and recover paid calls.",
  pages: [
    {
      slug: "api",
      title: "Automate API setup",
      summary: "Create, test, publish, and manage paid operations from CI or your own scripts.",
      seoDescription: "Use the PayGate402 seller API to import an OpenAPI operation, set a per-call USDC price, test it, and publish it over x402 HTTP and MCP.",
      content: <SellerApiGuide />,
    },
    {
      slug: "buyer-payments",
      title: "Call a paid API",
      summary: "Inspect an operation, pay over HTTP or MCP, and retrieve results and receipts.",
      seoDescription: "Call a PayGate402 endpoint with an x402 HTTP client or payment-aware MCP client. Check the test USDC price and recover your result and receipt.",
      content: <BuyerPaymentsGuide />,
    },
  ],
};
