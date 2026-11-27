import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { docsData } from "./docs/docsData";
import { PageMetadataContext, type SEOProps } from "./hooks/use-seo";
import App from "./App";
import NotFound from "./pages/not-found";

export const docsPaths = docsData.flatMap(section => [
  `/docs/${section.slug}`,
  ...section.pages.map(page => `/docs/${section.slug}/${page.slug}`),
]);

export function renderPage(pathname: string) {
  let metadata: SEOProps | undefined;
  const markup = renderToString(
    <PageMetadataContext.Provider value={value => { metadata = value; }}>
      <Router ssrPath={pathname}>
        {pathname === "/404" ? <NotFound /> : <App />}
      </Router>
    </PageMetadataContext.Provider>,
  );
  return { markup, metadata };
}
