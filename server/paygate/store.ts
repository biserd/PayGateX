import type { PaymentRequirements, ResourceInfo, SettleResponse } from "@x402/core/types";
import type { Activity, OperationInput, OperationStatus, PurchaseState } from "@shared/paygate";
import type { Input } from "./upstream";

export interface Sql {
  query<T>(sql: string, args?: any[]): Promise<{ rows: T[] }>;
}
export type Operation = {
  id: string; org_id: string; config: OperationInput; auth_cipher: string | null;
  status: OperationStatus; revision: number; tested_revision: number | null;
};
export type Authorization = { from: string; to: string; value: string; validAfter: string; validBefore: string; nonce: string };
export type Purchase = {
  id: string; operation_id: string; operation_revision: number; recovery_hash: string; snapshot: OperationInput; auth_cipher: string | null; input: Input;
  resource: ResourceInfo; requirement: PaymentRequirements; state: PurchaseState;
  authorization_key: string | null; evm_authorization: Authorization | null;
  settlement: SettleResponse | null; result: unknown; upstream_status: number | null;
  expires_at: Date; created_at: Date; updated_at: Date; version: number;
};

export class PaygateStore {
  constructor(private readonly db: Sql) {}
  private async one<T>(sql: string, ...params: any[]) {
    return (await this.db.query<T>(sql, params)).rows[0] as T | undefined;
  }
  async list(org: string) {
    return (await this.db.query<Operation>(
      "SELECT * FROM paygate_operations WHERE org_id = $1 ORDER BY created_at DESC", [org],
    )).rows;
  }
  operation(id: string) {
    return this.one<Operation>("SELECT * FROM paygate_operations WHERE id = $1", id);
  }
  create(id: string, org: string, config: OperationInput, auth: string | null) {
    return this.one<Operation>(`INSERT INTO paygate_operations (id, org_id, config, auth_cipher)
      VALUES ($1, $2, $3, $4) RETURNING *`, id, org, config, auth);
  }
  configure(op: Operation, config: OperationInput, auth: string | null) {
    return this.one<Operation>(`UPDATE paygate_operations SET config = $4, auth_cipher = $5,
      revision = revision + 1, status = 'draft', tested_revision = NULL, updated_at = now()
      WHERE id = $1 AND org_id = $2 AND revision = $3 RETURNING *`, op.id, op.org_id, op.revision, config, auth);
  }
  tested(op: Operation) {
    return this.one<Operation>(`UPDATE paygate_operations SET tested_revision = revision, updated_at = now()
      WHERE id = $1 AND org_id = $2 AND revision = $3 RETURNING *`, op.id, op.org_id, op.revision);
  }
  status(op: Operation, status: "published" | "paused") {
    return this.one<Operation>(`UPDATE paygate_operations SET status = $4, revision = revision + 1,
      tested_revision = CASE WHEN tested_revision = revision THEN revision + 1 ELSE NULL END, updated_at = now()
      WHERE id = $1 AND org_id = $2 AND revision = $3 AND ($4 <> 'published' OR tested_revision = revision)
      RETURNING *`, op.id, op.org_id, op.revision, status);
  }
  price(op: Operation, price: string) {
    return this.one<Operation>(`UPDATE paygate_operations SET config = jsonb_set(config, '{price}', to_jsonb($4::text)),
      revision = revision + 1, tested_revision = CASE WHEN tested_revision = revision THEN revision + 1 ELSE NULL END,
      updated_at = now() WHERE id = $1 AND org_id = $2 AND revision = $3 RETURNING *`, op.id, op.org_id, op.revision, price);
  }
  quote(op: Operation, id: string, hash: string, input: Input, resource: ResourceInfo, requirement: PaymentRequirements) {
    return this.one<Purchase>(`INSERT INTO paygate_purchases
      (id, operation_id, operation_revision, recovery_hash, snapshot, auth_cipher, input, resource, requirement)
      SELECT $3, id, revision, $4, config, auth_cipher, $5, $6, $7 FROM paygate_operations
      WHERE id = $1 AND revision = $2 AND status = 'published' RETURNING *`,
      op.id, op.revision, id, hash, input, resource, requirement);
  }
  purchase(id: string) {
    return this.one<Purchase>("SELECT * FROM paygate_purchases WHERE id = $1", id);
  }
  authorizationExists(key: string) {
    return this.one<{ id: string }>("SELECT id FROM paygate_purchases WHERE authorization_key = $1", key);
  }
  async claim(p: Purchase, op: Operation, key: string, auth: Authorization) {
    try {
      return await this.one<Purchase>(`UPDATE paygate_purchases p SET state = 'settling', authorization_key = $2,
        evm_authorization = $3, updated_at = now(), version = p.version + 1
        FROM paygate_operations o WHERE p.id = $1 AND p.state = 'quoted' AND p.expires_at > now()
        AND o.id = p.operation_id AND o.status = 'published' AND o.revision = $4
        AND o.revision = p.operation_revision RETURNING p.*`,
        p.id, key, auth, op.revision);
    } catch (err) {
      if ((err as { code?: string }).code === "23505") return undefined;
      throw err;
    }
  }
  async stale(p: Purchase) {
    if (p.state !== "settling" && p.state !== "fulfilling") return p;
    const next = p.state === "settling" ? "payment_unknown" : "upstream_unknown";
    return await this.one<Purchase>(`UPDATE paygate_purchases SET state = $3, updated_at = now(), version = version + 1
      WHERE id = $1 AND state = $2 AND version = $4 AND updated_at < now() - interval '90 seconds' RETURNING *`,
      p.id, p.state, next, p.version)
      ?? (await this.purchase(p.id))!;
  }
  transition(p: Purchase, next: PurchaseState, details: {
    settlement?: SettleResponse; result?: unknown; status?: number;
  } = {}) {
    return this.one<Purchase>(`UPDATE paygate_purchases SET state = $3, updated_at = now(), version = version + 1,
      settlement = COALESCE($4::jsonb, settlement), result = COALESCE($5::jsonb, result),
      upstream_status = COALESCE($6, upstream_status)
      WHERE id = $1 AND state = $2 AND version = $7 RETURNING *`,
      p.id, p.state, next, details.settlement ?? null,
      details.result === undefined ? null : JSON.stringify(details.result), details.status ?? null, p.version);
  }
  async activity(op: Operation): Promise<Activity> {
    const totals = await this.one<Omit<Activity, "recent">>(`SELECT
      count(*)::int AS calls,
      (count(*) FILTER (WHERE state IN ('failed','upstream_unknown','payment_unknown')))::int AS failures,
      coalesce(sum((requirement->>'amount')::numeric) FILTER (WHERE settlement IS NOT NULL), 0)::text AS "revenueAtomic"
      FROM paygate_purchases WHERE operation_id = $1 AND state <> 'quoted'`, op.id);
    const recent = (await this.db.query<Activity["recent"][number]>(`SELECT id, state, created_at AS "createdAt",
      CASE WHEN settlement IS NULL THEN NULL ELSE requirement->>'amount' END AS amount,
      upstream_status AS "upstreamStatus"
      FROM paygate_purchases WHERE operation_id = $1 AND state <> 'quoted'
      ORDER BY created_at DESC LIMIT 30`, [op.id])).rows;
    return { ...totals!, recent };
  }
}
