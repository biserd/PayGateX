export const siteOrigin = "https://paygate402.com";

export const indexablePages = new Set([
  "/", "/about", "/faq", "/contact", "/privacy", "/terms",
  "/docs", "/docs/seller/api", "/docs/seller/buyer-payments",
]);

export const appPages = new Set([
  "/auth", "/directory", "/dashboard", "/legacy-dashboard", "/admin", "/endpoints",
  "/analytics", "/compliance", "/escrow", "/audit", "/webhooks", "/api-keys",
  "/settings", "/wallet-test",
]);

export function isServicePath(pathname: string) {
  return /^\/(?:api|mcp|x402|healthz)(?:\/|$)/.test(pathname);
}

export function prerenderedAsset(pathname: string) {
  return pathname === "/" ? "/__pages/home.html" : `/__pages${pathname}.html`;
}
