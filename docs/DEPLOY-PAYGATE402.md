# Deploy PayGate402 on Cloudflare

Production runs at `https://paygate402.com`. The Worker serves the site, forwards API requests to a Cloudflare Container, and gives the container private access to Cloudflare D1 and Email Sending. D1 stores seller accounts and sessions, API keys, encrypted upstream credentials, operation revisions, purchase results, and receipts. The API container can restart without losing these records.

1. Confirm Cloudflare marks the zone **Active**. In **Email Service → Email Sending**, onboard `auth.paygate402.com` for `signin@auth.paygate402.com`. Set `PAYGATE_SUPPORT_EMAIL` to the address that should receive contact form submissions.
2. Ensure `d1_databases[0]` in `deploy/cloudflare/wrangler.production.jsonc` points to the intended PayGate402 database. Apply the migrations to that database before deploying.

```sh
npx wrangler d1 migrations apply paygate402-production --remote --config deploy/cloudflare/wrangler.production.jsonc
```

3. Set `PAYGATE_SECRET_KEY` as a Worker secret. Generate a 32-byte random key encoded as 64 hex characters for a fresh database. Keep the existing key when redeploying against a database with credentials. The Worker passes it only to the API container.

```sh
npx wrangler secret put PAYGATE_SECRET_KEY --config deploy/cloudflare/wrangler.production.jsonc
npm ci
npm run build
npx wrangler deploy --containers-rollout=immediate --config deploy/cloudflare/wrangler.production.jsonc
```

The Docker-based deploy builds the API image. To deploy a Linux image from GitHub Actions, publish its artifact to the Cloudflare registry, set `containers[0].image` to the immutable revision tag in a deployment copy of the Wrangler configuration, and deploy that copy. Keep the migrations directory relative to its configuration or use an absolute path.

4. Verify HTTPS, `/healthz` returning `{"ok":true,"database":"d1"}`, the sitemap, and the `www` redirect. Request and redeem a sign-in email in a test inbox. Publish a tool against a safe test upstream and verify price disclosure, MCP discovery, and purchase recovery. The live release currently supports only Base Sepolia testnet USDC.
5. Confirm a page view in GA4 Realtime for its existing web stream `G-37XNGFDSN4`. Check `https://paygate402.com/sitemap.xml` in the verified Search Console Domain property.

Run `npm run test:paygate:d1` with Node.js 22 to exercise the production API and D1 schema locally on a private test chain. The PostgreSQL fixture remains available via `npm run test:paygate`.

See [Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), and [Cloudflare Email Sending](https://developers.cloudflare.com/email-service/configuration/domains/).
