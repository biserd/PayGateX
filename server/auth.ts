import passport from "passport";
import type { Express, Request } from "express";
import session from "express-session";
import { createHash, randomBytes } from "node:crypto";
import connectPg from "connect-pg-simple";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { organizations, users, type User } from "@shared/schema";
import { db, pool } from "./db";
import { storage } from "./storage";
import { hasEmailSender, sendSignInLink } from "./email-service";

type SelectUser = User;
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export interface SignInMailer {
  available(): boolean;
  send(email: string, link: string): Promise<boolean>;
}

const emailAddress = z.string().trim().max(254).email().transform(email => email.toLowerCase());
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const publicUser = ({ id, username, email, role, orgId }: User) => ({ id, username, email, role, orgId });

async function redeemLink(tokenHash: string) {
  return db.transaction(async tx => {
    const { rows: [link] } = await tx.execute<{ email: string }>(
      sql`UPDATE auth_login_links SET token_hash = NULL
          WHERE token_hash = ${tokenHash} AND expires_at > now() RETURNING email`,
    );
    if (!link) return;

    const matching = await tx.select().from(users).where(sql`lower(${users.email}) = ${link.email}`).limit(2);
    if (matching.length === 1) return matching[0];
    if (matching.length > 1) return;

    const username = "seller-" + randomBytes(12).toString("hex");
    const [org] = await tx.insert(organizations).values({
      slug: username, name: "Seller workspace", email: link.email,
    }).returning();
    const [user] = await tx.insert(users).values({
      email: link.email, username, orgId: org.id, password: "",
    }).returning();
    return user;
  });
}

export function setupAuth(app: Express, mailer: SignInMailer = { available: hasEmailSender, send: sendSignInLink }) {
  const origin = process.env.PAYGATE_PUBLIC_URL;
  const sessionTtl = 7 * 24 * 60 * 60;
  const pgStore = connectPg(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    store: new pgStore({ pool, createTableIfMissing: false, ttl: sessionTtl, tableName: "sessions" }),
    cookie: { httpOnly: true, sameSite: "lax", secure: origin?.startsWith("https:") ?? false, maxAge: sessionTtl * 1000 },
  };
  if (sessionSettings.cookie?.secure) app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      done(null, await storage.getUser(id));
    } catch (error) {
      done(error);
    }
  });

  const sameOriginJson = (req: Request) => req.is("application/json")
    && (!req.get("Origin") || req.get("Origin") === origin);
  app.use("/api/auth/email", (_req, res, next) => {
    res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" });
    next();
  });
  app.post("/api/auth/email/request", async (req, res, next) => {
    if (!sameOriginJson(req)) return res.status(403).json({ error: "Send the request from the PayGate402 sign-in page." });
    const email = emailAddress.safeParse(req.body?.email);
    if (!email.success) return res.status(400).json({ error: "Enter a valid email address." });
    if (!origin || !mailer.available()) return res.status(503).json({ error: "Sign-in email is temporarily unavailable." });
    try {
      const accepted = () => res.status(202).json({ message: "Check your email for a sign-in link." });
      const key = hash(req.ip || req.socket.remoteAddress || "unknown");
      const limit = await pool.query(
        `INSERT INTO auth_link_request_limits (client_key, window_ends_at, requests)
         VALUES ($1, now() + interval '15 minutes', 1)
         ON CONFLICT (client_key) DO UPDATE SET
           requests = CASE WHEN auth_link_request_limits.window_ends_at <= now() THEN 1 ELSE auth_link_request_limits.requests + 1 END,
           window_ends_at = CASE WHEN auth_link_request_limits.window_ends_at <= now() THEN EXCLUDED.window_ends_at ELSE auth_link_request_limits.window_ends_at END
         WHERE auth_link_request_limits.window_ends_at <= now() OR auth_link_request_limits.requests < 10`,
        [key],
      );
      if (!limit.rowCount) return res.set("Retry-After", "900").status(429).json({ error: "Too many requests. Try again in a few minutes." });
      await pool.query("DELETE FROM auth_link_request_limits WHERE window_ends_at <= now()");
      await pool.query("DELETE FROM auth_login_links WHERE expires_at <= now()");

      const token = randomBytes(32).toString("base64url");
      const tokenHash = hash(token);
      const issued = await pool.query(
        `INSERT INTO auth_login_links (email, token_hash, issued_at, expires_at)
         VALUES ($1, $2, now(), now() + interval '15 minutes')
         ON CONFLICT (email) DO UPDATE
         SET token_hash = EXCLUDED.token_hash, issued_at = EXCLUDED.issued_at, expires_at = EXCLUDED.expires_at
         WHERE auth_login_links.issued_at <= now() - interval '1 minute'`,
        [email.data, tokenHash],
      );
      if (!issued.rowCount) return accepted();
      const link = new URL("/auth", origin);
      link.hash = new URLSearchParams({ token }).toString();
      if (!(await mailer.send(email.data, link.href))) {
        await pool.query("DELETE FROM auth_login_links WHERE token_hash = $1", [tokenHash]);
        return res.status(503).json({ error: "Sign-in email could not be sent. Try again shortly." });
      }
      return accepted();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/email/redeem", async (req, res, next) => {
    if (!sameOriginJson(req)) return res.status(403).json({ error: "Open the link on the PayGate402 site." });
    const invalid = () => res.status(400).json({ error: "This link is invalid, expired, or already used. Request a new one." });
    const token = req.body?.token;
    if (typeof token !== "string" || !tokenPattern.test(token)) return invalid();
    try {
      const user = await redeemLink(hash(token));
      if (!user) return invalid();
      req.login(user, error => {
        if (error) return next(error);
        res.json(publicUser(user));
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout(error => {
      if (error) return next(error);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    res.set("Cache-Control", "no-store");
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(publicUser(req.user));
  });
}
