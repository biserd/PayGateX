import type { Sql } from "../paygate/store";

type BindValue = string | number | null;
type Row = Record<string, unknown>;
type Statement = { sql: string; params?: unknown[] };
type BoundStatement = { sql: string; params: BindValue[] };
export type D1Execute = (statements: BoundStatement[]) => Promise<Row[][]>;

const jsonColumns = ["config", "snapshot", "input", "resource", "requirement", "evm_authorization", "settlement", "result"];

export class D1Sql implements Sql {
  constructor(private readonly execute: D1Execute) {}

  async batch(statements: Statement[]) {
    return this.execute(statements.map(({ sql, params = [] }) => ({
      sql: sql.replace(/\$(\d+)/g, "?$1"),
      params: params.map(value => {
        if (value === null || typeof value === "string" || typeof value === "number") return value;
        return JSON.stringify(value);
      }),
    })));
  }

  async query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }> {
    const [rows] = await this.batch([{ sql, params }]);
    return { rows: rows.map(row => {
      for (const column of jsonColumns) {
        if (typeof row[column] === "string") row[column] = JSON.parse(row[column]);
      }
      return row as T;
    }) };
  }
}

export function containerD1(url: string) {
  const endpoint = new URL(url);
  return new D1Sql(async statements => {
    const response = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statements), signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error("D1 query failed");
    return await response.json() as Row[][];
  });
}
