import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";

const app = express();
if (process.env.PAYGATE_PUBLIC_URL === "https://paygate402.com") {
  const liveOrigin = new URL(process.env.PAYGATE_PUBLIC_URL);
  app.use((req, res, next) => {
    const host = req.get("host")?.toLowerCase();
    if (host === "www.paygate402.com" && ["GET", "HEAD"].includes(req.method)) {
      return res.redirect(308, liveOrigin.origin + req.originalUrl);
    }
    if (host !== liveOrigin.host) res.set("X-Robots-Tag", "noindex");
    next();
  });
}
app.use(express.json({ limit: "128kb" }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path.slice(0, 100)} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  app.get("/healthz", async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      await pool.query("SELECT 1");
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    const status = err.status || err.statusCode || 500;
    const message = status >= 500 ? "Internal Server Error" : err.type === "entity.parse.failed" ? "Invalid JSON" : err.message;

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
