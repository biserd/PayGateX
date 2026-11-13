# PayGate402: setup, demo and seller API

PayGate402 publishes an existing JSON API operation as a priced HTTP endpoint and an MCP tool. The MVP uses x402 v2 exact EIP-3009 USDC on Base Sepolia, paid directly to the seller's configured wallet. Use a local sandbox for free testing.

## Run the complete sandbox

Requires Node.js 20+ and npm. No credentials, cloud database, testnet wallet, or funds are needed. From this branch:

```sh
npm ci
npm run check:paygate
npm run build
npm run test:paygate
npm run demo:paygate -- --serve
```

The last command runs the demo, then leaves the seller console open at `http://127.0.0.1:5000/auth` (override with `PORT`). Sign in with `sandbox_seller` / `local-sandbox-only`. The database, wallets, chain and upstreams are local and temporary; stop them with Ctrl+C.

The demo imports a weather GET operation with a path string and integer query input, then configures a separate inventory POST with typed body fields and an API key. It publishes both using the seller API, executes a weather purchase over HTTP and an inventory purchase over MCP, and reads the seller's sandbox token balance and stored receipts. The test also covers cross-tenant access, draft privacy, invalid and unpaid calls, price changes, pause, concurrent retries, duplicate authorizations, paid failures, disconnected clients and uncertain settlement/upstream outcomes. The chain uses a local EIP-3009 token at the Base Sepolia USDC address for wire compatibility; no public chain transaction is sent.

## Run with PostgreSQL and a testnet facilitator

Set `DATABASE_URL` to your PostgreSQL connection string. For a **fresh development database**, initialize the existing app tables first. On an existing database with the app tables, apply only the PayGate402 migration and build.

```sh
npm ci
npm run db:push
npm run db:paygate
npm run build
```

Set these variables before starting:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string; require TLS for a remote database |
| `SESSION_SECRET` | Random secret of at least 32 characters |
| `PAYGATE_SECRET_KEY` | Persistent AES key: 32 random bytes as 64 hex characters |
| `PAYGATE_PUBLIC_URL` | Bare HTTPS origin behind one trusted reverse proxy, or `http://127.0.0.1:5000` for local use |
| `PAYGATE_FACILITATOR_URL` | Optional; defaults to `https://x402.org/facilitator`. Must support exact v2 on `eip155:84532` |
| `PAYGATE_RPC_URL` | Optional trusted Base Sepolia RPC URL for settlement reconciliation |
| `PORT` | Optional, defaults to `5000` |

Generate each secret independently with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep the encryption key across restarts and outside the database. Start with `node dist/index.js` with `NODE_ENV=production` (PowerShell: `$env:NODE_ENV = 'production'; node dist/index.js`).

Sign up at `/auth`, then use **Paid tools**. Only Base Sepolia USDC is supported. To pay on public testnet, use a funded Base Sepolia USDC buyer and a valid seller wallet. Default upstreams require a public HTTPS destination on port 443, without redirects, user info, query strings, or fragments. Buyer inputs can supply query parameters and path fields. The local demo permits only operator-listed `127.0.0.1` fixture origins. Keep `PAYGATE_ENABLE_LEGACY` unset: the old v1 demo uses a shared demo organization and is unsuitable for public deployment.

## Seller API

Prefix: `/api/seller/v1/operations`. Use the console's sign-in cookie or `Authorization: Bearer $SELLER_KEY`. Generate and revoke keys under **API Keys**; they grant configuration and payout write access for their organization. Requests and mutation responses are JSON. Writes to existing operations use the latest integer `revision` returned by the API; stale writes return HTTP 409.

| Method and path relative to prefix | Body / result |
| --- | --- |
| `GET /` | List your operations |
| `POST /import` | `{document,path,method}` → editable partial configuration from one OpenAPI 3.0/3.1 JSON operation |
| `POST /` | `{config,auth?}` → new draft and its revision |
| `GET /:id` | Get configuration and current revision; includes `hasAuth`, never the secret |
| `PUT /:id` | `{config,revision,auth?}` → replace config and return to draft; omit auth to keep it, explicitly set `{type:"none"}` to remove it |
| `POST /:id/test` | `{revision,input}` → sandbox upstream response; a real upstream call without payment |
| `POST /:id/publish` | `{revision}` → publish a tested revision, return HTTP/MCP connection details |
| `PATCH /:id/price` | `{revision,price}` → update price without rerunning a previously passed upstream test |
| `POST /:id/pause` | `{revision}` → remove discovery and reject new purchases; settled purchases remain retrievable |
| `GET /:id/activity` | Charged/attempted calls, settled atomic USDC revenue, failed or unresolved calls and the latest 30 attempts |

Example create request body (use your actual upstream and payout wallet):

```json
{
  "config": {
    "name": "weather_forecast",
    "description": "Find a forecast by city",
    "url": "https://weather.example.com/forecast/{city}",
    "method": "GET",
    "price": "0.02",
    "payTo": "0x1111111111111111111111111111111111111111",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "properties": { "city": { "type": "string" }, "days": { "type": "integer", "minimum": 1 } },
      "required": ["city", "days"]
    },
    "mappings": [
      { "input": "city", "in": "path", "name": "city" },
      { "input": "days", "in": "query", "name": "days" }
    ]
  },
  "auth": { "type": "header", "header": "X-API-Key", "value": "replace-with-your-upstream-key" }
}
```

The console calls these same endpoints. Supported upstream auth types are `none`, `bearer` and a custom `x-*` header. Credentials are encrypted in the operation and purchase snapshot; no buyer request headers are forwarded. The OpenAPI importer supports inline path/query parameters and inline JSON object bodies. It does not fetch specs or resolve references. Store CI credentials in your CI secret store.

## Buyer flow and recovery

1. Read `GET /x402/tools/:id` for schema and price, or use MCP `tools/list` on the provided Streamable HTTP URL. An ordinary MCP client can discover the tool and see the challenge. A payment-aware client is needed to sign and retry it.
2. Send arguments as a JSON object to `POST /x402/tools/:id` or as MCP `tools/call` arguments. HTTP returns `402` and `PAYMENT-REQUIRED`. MCP returns an error tool result with the same v2 object in structured and text content.
3. **Save the quote's `resource.url` before retrying.** It is the private purchase recovery URL, containing the purchase ID and a random recovery credential. The ID alone cannot retrieve a result. Treat the URL like a bearer secret; do not share or log it. It is also in the HTTP challenge body. The official SDK copies it into the retry payment payload. HTTP sends `PAYMENT-SIGNATURE`; MCP uses `_meta["x402/payment"]`.
4. On settlement, the server attaches the x402 settlement response as `PAYMENT-RESPONSE` or `_meta["x402/payment-response"]`. The JSON result contains the purchase ID, state, result when available and the receipt with recipient, amount, payer, network and transaction. Repeat the same paid request or read `GET <recoveryUrl>`. A new unsigned call creates a new quote and should not be used to recover a paid call.

Quotes expire after five minutes or when the seller edits, pauses or republishes the operation. The payment authorization nonce is unique across purchases. Concurrent retries cannot run settlement or fulfillment twice. Once payment is settled, a failed upstream call still has a receipt; the MVP does not automatically refund it.

| State | Next step |
| --- | --- |
| `settling`, `fulfilling` | Poll the recovery URL |
| `paid`, `retryable` | `POST <recoveryUrl>/resume` to finish without paying again |
| `upstream_unknown` | `POST <recoveryUrl>/reconcile`; a mutating operation needs a conclusive status response before retry |
| `payment_unknown` | `POST <recoveryUrl>/reconcile` to look for the exact transfer on-chain; this does not rebroadcast |
| `succeeded`, `failed` | Read the stored outcome and receipt |

For a mutating operation, configure a same-origin `statusUrl`. PayGate402 sends `Idempotency-Key: <purchaseId>` on the call and queries the status URL with `?purchaseId=<purchaseId>`. The status endpoint must return `{"state":"succeeded","result":...}`, `{"state":"failed"}`, `{"state":"pending"}`, or `{"state":"not_executed"}`. Return `not_executed` only when the original request cannot later commit. If that guarantee is unavailable, leave the purchase unresolved until the upstream can confirm its outcome.

## Compatibility and release limits

- Tested: `@x402/fetch` 2.31.0; `@x402/mcp` 2.31.0 wrapping `@modelcontextprotocol/sdk` 1.32.2 over Streamable HTTP. Both used the official EVM exact scheme against the local sandbox facilitator and chain.
- [x402 v2 HTTP transport](https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/http.md) · [x402 v2 MCP transport](https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/mcp.md) · [Coinbase's supported MCP buyer wrapper](https://docs.cdp.coinbase.com/x402/buyer/mcp-payments).
- **ChatGPT plugin:** not installed or tested. The documented [ChatGPT checkout flow](https://developers.openai.com/plugins/build/monetization) is distinct from the x402 retry used here; do not assume ChatGPT can pay these tools.
- Public Base Sepolia settlement, mainnet, smart-wallet/Permit2 payments, automated refunds, payout ownership verification, production-scale quotas and data retention are outside this demo. Set edge rate limits and define retention and an operational reconciliation policy before a public launch. Full repository `npm run check` is blocked by pre-existing syntax errors in `server/storage-old.ts`; `npm run check:paygate` covers the new flow.
