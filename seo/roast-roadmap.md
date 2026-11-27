# PayGate402 search and conversion

November 27, 2026

The live homepage and docs returned an empty React root. Both guides linked from the homepage also sent a noindex header. The production robots file allows public pages, and the sitemap previously listed six pages without the docs.

| Priority | Issue | Change | Owner |
| --- | --- | --- | --- |
| 1 | Search crawlers need JavaScript to read the homepage and guides. | Generate HTML from the React pages during the build and serve it directly from Worker assets. Keep the homepage example and Base Sepolia testnet disclosure visible in the HTML. | Engineering |
| 2 | Search cannot index the current setup and payment guides. | Make both guides and the docs hub indexable, add them to the sitemap, and include page-specific metadata. | Engineering |
| 3 | An unknown page can reach the application container and return a startup error. | Serve an HTML 404 from Worker assets and preserve service routing for HTTP payments, MCP, health, and API calls. | Engineering |
| 4 | Search performance and setup conversion need a production baseline. | After release, inspect the homepage and two guides in Search Console. Track search clicks by landing page and first published operation as the activation outcome. | Product |

Check the homepage without JavaScript, the two guide canonicals, and the sitemap after deployment. Verify that an unknown docs URL returns HTTP 404 and the Dashboard sends a noindex header. The highest-intent visitors should be able to reach email sign-in from the homepage and the setup guide in one click.
