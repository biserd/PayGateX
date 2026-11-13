import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before applying the migration");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const sql = await readFile(new URL("../migrations/0001_paygate402.sql", import.meta.url), "utf8");
  await pool.query("BEGIN;\n" + sql + "\nCOMMIT;");
  console.log("PayGate402 schema ready");
} finally {
  await pool.end();
}
