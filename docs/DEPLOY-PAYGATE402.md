# Deploy PayGate402 to paygate402.com

Use the apex hostname `https://paygate402.com`. The repo is configured for Replit Autoscale and requires a Node.js server and PostgreSQL.

1. Open the existing Replit project and pull the release commit. In Publishing, use `npm run build` and `npm run start`.
2. Ensure the production database has the existing app tables. For a fresh, empty development database, use `npm run db:push` once. On the production database, apply the additive MVP migration with `npm run db:paygate` before starting the new release. Keep the existing database and back it up before making schema changes.
3. Set `DATABASE_URL`, `SESSION_SECRET`, a persistent `PAYGATE_SECRET_KEY`, and `PAYGATE_PUBLIC_URL=https://paygate402.com` in the production environment. Keep secrets in the hosting environment. See the [application setup guide](PAYGATE402.md) for their formats and the optional facilitator and RPC settings.
4. Publish the app and check `/healthz` on its deployment URL. Add `paygate402.com` as a custom domain in Replit and copy the exact A and TXT values for that deployment into Cloudflare. Set the A record to **DNS only** so Replit can manage HTTPS. Keep the verification record for certificate renewal. Only add `www` if it will also be bound to the deployment with a valid certificate.
5. Preserve existing MX, TXT and any subdomain records from the Name.com zone before changing nameservers. After Name.com clears the `clientHold` and the DNS records are ready, set the registrar to the Cloudflare nameservers shown for the zone. Check DNS, TLS, the homepage, seller sign-in, and the payment routes on the apex.
6. Use the existing PayGate402 GA4 property and web stream for `https://paygate402.com`. The app loads measurement ID `G-37XNGFDSN4` on the apex. Use GA4 Realtime to confirm a page view after release.
7. Verify the existing `paygate402.com` Search Console Domain property using the apex TXT record. Submit `https://paygate402.com/sitemap.xml`. Link the verified property to the existing GA4 web stream under **Admin → Search Console links**.

Use the [Replit custom domain guide](https://docs.replit.com/features/publishing/custom-domains), [Cloudflare nameserver setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/), and [Search Console DNS verification guide](https://support.google.com/webmasters/answer/9008080) for the account-side steps.
