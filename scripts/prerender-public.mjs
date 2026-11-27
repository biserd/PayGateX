import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";

const output = resolve("dist/public");
const template = await readFile(resolve(output, "index.html"), "utf8");
const vite = await createServer({ appType: "custom", server: { middlewareMode: true, watch: null, ws: false } });
const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function htmlDocument(pathname, markup, metadata, siteOrigin) {
  const title = escape(metadata ? `${metadata.title} | PayGate402` : "Page not found | PayGate402");
  const description = escape(metadata?.description ?? "Find PayGate402 documentation or return to the homepage.");
  const canonical = escape(new URL(metadata?.path ?? pathname, siteOrigin).href);
  return template
    .replace(/<title>.*?<\/title>/, () => `<title>${title}</title>`)
    .replace(/(<meta name="title" content=")[^"]*/, (_, start) => start + title)
    .replace(/(<meta name="description" content=")[^"]*/, (_, start) => start + description)
    .replace(/(<link rel="canonical" href=")[^"]*/, (_, start) => start + canonical)
    .replace(/(<meta property="(?:og|twitter):(title|description|url)" content=")[^"]*/g,
      (_, start, field) => start + ({ title, description, url: canonical })[field])
    .replace('<div id="root"></div>', () => `<div id="root"${metadata ? " data-prerendered" : ""}>${markup}</div>`)
    .replace("</head>", () => {
      const schema = metadata?.structuredData;
      const script = schema ? `<script type="application/ld+json" data-structure="page-schema">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>` : "";
      return script + "</head>";
    });
}

try {
  const { indexablePages, prerenderedAsset, siteOrigin } = await vite.ssrLoadModule("/@fs/" + resolve("shared/public-pages.ts").replaceAll("\\", "/"));
  const { docsPaths, renderPage } = await vite.ssrLoadModule("/src/prerender.tsx");
  for (const pathname of new Set([...indexablePages, ...docsPaths, "/404"])) {
    const { markup, metadata } = renderPage(pathname);
    if (pathname !== "/404" && !metadata) throw new Error(`Missing page metadata for ${pathname}`);
    const file = resolve(output, "." + prerenderedAsset(pathname));
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, htmlDocument(pathname, markup, metadata, siteOrigin));
  }
  const entries = [...indexablePages].map(pathname => `  <url><loc>${siteOrigin}${pathname}</loc></url>`);
  await writeFile(resolve(output, "sitemap.xml"), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries, "</urlset>", "",
  ].join("\n"));
} finally {
  await vite.close();
}
