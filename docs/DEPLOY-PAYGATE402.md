# Deploy PayGate402 on Cloudflare

Use `https://paygate402.com` for production. The production Worker runs the PayGate402 Node application in a container and stores users, seller configurations and purchase receipts in external PostgreSQL.

1. Confirm the zone is **Active** in Cloudflare and that both assigned nameservers are authoritative. Keep existing email and verification records. In **Email Service → Email Sending**, onboard `auth.paygate402.com` and verify the sender DNS records for `signin@auth.paygate402.com`.
2. Identify the existing PayGate402 database and back it up before applying migrations. For a new, empty PayGate402 database, initialize the base schema once with `npm run db:push`. Apply the additive migrations with `npm run db:paygate` against the intended database. Use the persistent upstream credential encryption key if the database already contains PayGate402 tools.
3. Set the following secrets on the **paygate402** Worker. Set them through Cloudflare or pass them from a secure runner using Wrangler's `--secrets-file` option. See the [application setup guide](PAYGATE402.md) for formats and optional facilitator and RPC settings.
   - `DATABASE_URL` with PostgreSQL TLS
   - `SESSION_SECRET`
   - `PAYGATE_SECRET_KEY`
4. Build and deploy the production container with Docker and Wrangler, or use the Linux image from the production workflow. With the existing registry image workflow, publish the artifact to the Cloudflare registry and set `containers[0].image` to its revision tag in a deployment copy of the Wrangler configuration.

```sh
npm run build
wrangler deploy --config deploy/cloudflare/wrangler.production.jsonc
```

The production Worker registers `paygate402.com` and `www.paygate402.com` as custom domains and redirects `www` to the apex. Cloudflare serves public pages and static assets at the edge. The app container handles APIs and seller sessions. The staging Worker runs separately on `workers.dev`.

1. Verify HTTPS, `/healthz`, the landing page, the sitemap, and the `www` redirect. Request and redeem a real sign-in email with a test inbox. Publish a tool against a safe test upstream and verify the x402 price, MCP discovery and purchase recovery with Base Sepolia testnet USDC.
2. Confirm a page view in GA4 Realtime for web stream `G-37XNGFDSN4`. Verify the Search Console Domain property via DNS, submit `https://paygate402.com/sitemap.xml`, and link the verified property to the existing GA4 web stream.

See [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Cloudflare Email Sending](https://developers.cloudflare.com/email-service/configuration/domains/), and [Search Console DNS verification](https://support.google.com/webmasters/answer/9008080).
