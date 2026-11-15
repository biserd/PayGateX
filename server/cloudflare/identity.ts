import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { apiKeyService } from "../services/api-key-service";
import { randomIdPattern } from "../paygate/payment";
import { sqliteNow } from "../paygate/store";
import type { D1Sql } from "./d1";

type Seller = { id: string; orgId: string; email: string; username: string; role: string };
export type SignInMailer = { available(): boolean; send(email: string, link: string): Promise<boolean> };
const emailAddress = z.string().trim().max(254).email().transform(email => email.toLowerCase());
const keyName = z.string().trim().min(1).max(100);
const tokenFormat = /^[A-Za-z0-9_-]{43}$/;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const token = () => randomBytes(32).toString("base64url");
const userFields = "u.id, u.id AS orgId, u.email, u.username, u.role";
const sessionSeconds = 7 * 24 * 60 * 60;
const keyFields = `id, org_id AS orgId, name, prefix, created_at AS createdAt, revoked_at AS revokedAt,
  CASE WHEN revoked_at IS NULL THEN 1 ELSE 0 END AS isActive`;

export async function takeRequestSlot(db: D1Sql, key: string, maximum: number) {
  const limit = await db.query(
    `INSERT INTO auth_link_request_limits (client_key, window_ends_at, requests)
     VALUES ($1, unixepoch() + 900, 1)
     ON CONFLICT (client_key) DO UPDATE SET
       requests = CASE WHEN window_ends_at <= unixepoch() THEN 1 ELSE requests + 1 END,
       window_ends_at = CASE WHEN window_ends_at <= unixepoch() THEN excluded.window_ends_at ELSE window_ends_at END
     WHERE window_ends_at <= unixepoch() OR requests < $2 RETURNING requests`,
    [hash(key), maximum],
  );
  return limit.rows.length > 0;
}

export function registerIdentity(app: Express, db: D1Sql, origin: string, mailer: SignInMailer) {
  const secure = origin.startsWith("https:");
  const cookieName = secure ? "__Host-paygate_session" : "paygate_session";
  const cookie = { httpOnly: true, secure, sameSite: "lax", path: "/" } as const;
  const sameOrigin = (req: Request) => !req.get("Origin") || req.get("Origin") === origin;
  const sessions = new WeakMap<Request, Promise<Seller | undefined>>();
  const cookieHash = (req: Request) => {
    const entry = req.get("cookie")?.split(";").map(c => c.trim()).find(c => c.startsWith(cookieName + "="));
    const value = entry?.slice(cookieName.length + 1);
    return value && tokenFormat.test(value) ? hash(value) : undefined;
  };
  function seller(req: Request) {
    const session = sessions.get(req);
    if (session) return session;
    const digest = cookieHash(req);
    const loaded = digest
      ? db.query<Seller>(`SELECT ${userFields} FROM seller_sessions s JOIN seller_users u ON u.id = s.user_id
          WHERE s.token_hash = $1 AND s.expires_at > unixepoch()`, [digest]).then(({ rows }) => rows[0])
      : Promise.resolve(undefined);
    sessions.set(req, loaded);
    return loaded;
  }
  const route = (handler: (req: Request, res: Response) => Promise<unknown>) =>
    (req: Request, res: Response, next: NextFunction) => {
      res.set({ "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" });
      void handler(req, res).catch(next);
    };

  app.post("/api/auth/email/request", route(async (req, res) => {
    if (!sameOrigin(req) || !req.is("application/json")) return res.status(403).json({ error: "Send the request from the PayGate402 sign-in page." });
    const email = emailAddress.safeParse(req.body?.email);
    if (!email.success) return res.status(400).json({ error: "Enter a valid email address." });
    if (!mailer.available()) return res.status(503).json({ error: "Sign-in email is temporarily unavailable." });
    if (!await takeRequestSlot(db, "login:" + req.ip, 10)) {
      return res.set("Retry-After", "900").status(429).json({ error: "Too many requests. Try again in a few minutes." });
    }
    const raw = token();
    const digest = hash(raw);
    const [issued] = await db.batch([
      {
        sql: `INSERT INTO auth_login_links (email, token_hash, issued_at, expires_at)
              VALUES ($1, $2, unixepoch(), unixepoch() + 900)
              ON CONFLICT (email) DO UPDATE SET token_hash = excluded.token_hash, issued_at = excluded.issued_at,
                expires_at = excluded.expires_at WHERE issued_at <= unixepoch() - 60 RETURNING email`,
        params: [email.data, digest],
      },
      { sql: "DELETE FROM auth_link_request_limits WHERE client_key IN (SELECT client_key FROM auth_link_request_limits WHERE window_ends_at <= unixepoch() LIMIT 100)" },
      { sql: "DELETE FROM auth_login_links WHERE email IN (SELECT email FROM auth_login_links WHERE expires_at <= unixepoch() LIMIT 100)" },
    ]);
    if (issued.length) {
      const link = new URL("/auth", origin);
      link.hash = new URLSearchParams({ token: raw }).toString();
      if (!await mailer.send(email.data, link.href)) {
        await db.query("DELETE FROM auth_login_links WHERE token_hash = $1", [digest]);
        return res.status(503).json({ error: "Sign-in email could not be sent. Try again shortly." });
      }
    }
    res.status(202).json({ message: "Check your email for a sign-in link." });
  }));

  app.post("/api/auth/email/redeem", route(async (req, res) => {
    if (!sameOrigin(req) || !req.is("application/json")) return res.status(403).json({ error: "Open the link on the PayGate402 site." });
    const invalid = () => res.status(400).json({ error: "This link is invalid, expired, or already used. Request a new one." });
    const raw = req.body?.token;
    if (typeof raw !== "string" || !tokenFormat.test(raw)) return invalid();
    const digest = hash(raw);
    const session = token();
    const sessionHash = hash(session);
    const priorSession = cookieHash(req);
    const [, , , , users] = await db.batch([
      {
        sql: `INSERT INTO seller_users (id, email, username)
              SELECT $2, email, $3 FROM auth_login_links WHERE token_hash = $1 AND expires_at > unixepoch()
              ON CONFLICT (email) DO NOTHING`,
        params: [digest, randomUUID(), "seller-" + randomBytes(12).toString("hex")],
      },
      {
        sql: `INSERT INTO seller_sessions (token_hash, user_id, expires_at)
              SELECT $2, u.id, unixepoch() + $3 FROM auth_login_links l JOIN seller_users u ON u.email = l.email
              WHERE l.token_hash = $1 AND l.expires_at > unixepoch()`,
        params: [digest, sessionHash, sessionSeconds],
      },
      { sql: "DELETE FROM auth_login_links WHERE token_hash = $1 AND expires_at > unixepoch()", params: [digest] },
      {
        sql: "DELETE FROM seller_sessions WHERE token_hash = $1 AND EXISTS (SELECT 1 FROM seller_sessions WHERE token_hash = $2)",
        params: [priorSession ?? null, sessionHash],
      },
      {
        sql: `SELECT ${userFields} FROM seller_sessions s JOIN seller_users u ON u.id = s.user_id WHERE s.token_hash = $1`,
        params: [sessionHash],
      },
      { sql: "DELETE FROM seller_sessions WHERE token_hash IN (SELECT token_hash FROM seller_sessions WHERE expires_at <= unixepoch() LIMIT 100)" },
    ]);
    if (!users.length) return invalid();
    res.cookie(cookieName, session, { ...cookie, maxAge: sessionSeconds * 1000 }).json(users[0]);
  }));

  app.get("/api/user", route(async (req, res) => {
    const user = await seller(req);
    return user ? res.json(user) : res.sendStatus(401);
  }));

  app.post("/api/logout", route(async (req, res) => {
    if (!sameOrigin(req)) return res.sendStatus(403);
    const digest = cookieHash(req);
    if (digest) await db.query("DELETE FROM seller_sessions WHERE token_hash = $1", [digest]);
    res.clearCookie(cookieName, cookie).sendStatus(200);
  }));

  const sellerKeys = (handler: (req: Request, res: Response, user: Seller) => Promise<unknown>) => route(async (req, res) => {
    const user = await seller(req);
    if (!user) return res.sendStatus(401);
    if (!["member", "admin"].includes(user.role) || !sameOrigin(req)) return res.sendStatus(403);
    return handler(req, res, user);
  });
  app.get("/api/keys", sellerKeys(async (_req, res, user) => {
    const { rows } = await db.query<Record<string, unknown>>(`SELECT ${keyFields} FROM seller_api_keys WHERE org_id = $1 ORDER BY created_at DESC`, [user.orgId]);
    res.json(rows.map(key => ({ ...key, isActive: Boolean(key.isActive) })));
  }));
  app.post("/api/keys", sellerKeys(async (req, res, user) => {
    if (!req.is("application/json")) return res.sendStatus(415);
    const name = keyName.safeParse(req.body?.name);
    if (!name.success) return res.status(400).json({ error: "Enter a name up to 100 characters." });
    const { key, hash, prefix } = apiKeyService.generateKey();
    const { rows: [created] } = await db.query<Record<string, unknown>>(
      `INSERT INTO seller_api_keys (id, org_id, name, key_hash, prefix) VALUES ($1, $2, $3, $4, $5) RETURNING ${keyFields}`,
      [randomUUID(), user.orgId, name.data, hash, prefix],
    );
    res.json({ ...created, isActive: true, key });
  }));
  app.delete("/api/keys/:id", sellerKeys(async (req, res, user) => {
    if (!randomIdPattern.test(req.params.id)) return res.status(404).json({ error: "API key not found" });
    const { rows } = await db.query(`UPDATE seller_api_keys SET revoked_at = COALESCE(revoked_at, ${sqliteNow})
      WHERE id = $1 AND org_id = $2 RETURNING id`, [req.params.id, user.orgId]);
    return rows.length ? res.json({ success: true }) : res.status(404).json({ error: "API key not found" });
  }));
  return {
    seller,
    async getApiKeyByHash(keyHash: string) {
      const { rows: [row] } = await db.query<{ orgId: string }>(
        "SELECT org_id AS orgId FROM seller_api_keys WHERE key_hash = $1 AND revoked_at IS NULL", [keyHash],
      );
      return row && { ...row, isActive: true, revokedAt: null };
    },
  };
}
