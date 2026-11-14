import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before applying the migration");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const file of ["0001_paygate402.sql", "0002_passwordless_auth.sql"]) {
    const sql = await readFile(new URL("../migrations/" + file, import.meta.url), "utf8");
    await pool.query("BEGIN;\n" + sql + "\nCOMMIT;");
  }
  console.log("PayGate402 schema ready");
} finally {
  await pool.end();
}
