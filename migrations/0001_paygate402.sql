CREATE TABLE IF NOT EXISTS paygate_operations (
  id uuid PRIMARY KEY,
  org_id varchar NOT NULL REFERENCES organizations(id),
  config jsonb NOT NULL,
  auth_cipher text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused')),
  revision integer NOT NULL DEFAULT 1,
  tested_revision integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS paygate_operations_org ON paygate_operations (org_id, created_at DESC);

CREATE TABLE IF NOT EXISTS paygate_purchases (
  id uuid PRIMARY KEY,
  operation_id uuid NOT NULL REFERENCES paygate_operations(id),
  operation_revision integer NOT NULL,
  recovery_hash text NOT NULL,
  snapshot jsonb NOT NULL,
  auth_cipher text,
  input jsonb NOT NULL,
  resource jsonb NOT NULL,
  requirement jsonb NOT NULL,
  state text NOT NULL DEFAULT 'quoted' CHECK (state IN (
    'quoted', 'settling', 'payment_unknown', 'paid', 'fulfilling',
    'succeeded', 'failed', 'upstream_unknown', 'retryable'
  )),
  authorization_key text UNIQUE,
  evm_authorization jsonb,
  settlement jsonb,
  result jsonb,
  upstream_status integer,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '5 minutes'
);
CREATE INDEX IF NOT EXISTS paygate_purchases_activity ON paygate_purchases (operation_id, created_at DESC);
