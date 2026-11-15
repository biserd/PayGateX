import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";
import { D1Sql } from "../server/cloudflare/d1";

export async function sqliteFixture(cleanup: Array<() => Promise<unknown>>) {
  const sqlite = new DatabaseSync(":memory:");
  cleanup.push(async () => sqlite.close());
  sqlite.exec(await readFile(new URL("../deploy/cloudflare/d1/0001_paygate402.sql", import.meta.url), "utf8"));

  return new D1Sql(async statements => {
    sqlite.exec("BEGIN");
    try {
      const results = statements.map(({ sql, params }) => {
        const ordered: typeof params = [];
        const statement = sql.replace(/\?(\d+)/g, (_placeholder, index) => {
          ordered.push(params[Number(index) - 1]);
          return "?";
        });
        return sqlite.prepare(statement).all(...ordered);
      });
      sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  });
}
