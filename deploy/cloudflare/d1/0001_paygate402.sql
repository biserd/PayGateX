CREATE TABLE seller_users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin','viewer'))
);

CREATE TABLE seller_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES seller_users(id),
  expires_at INTEGER NOT NULL
);
CREATE INDEX seller_sessions_expiry ON seller_sessions (expires_at);

CREATE TABLE auth_login_links (
  email TEXT PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  issued_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX auth_login_links_expiry ON auth_login_links (expires_at);

CREATE TABLE auth_link_request_limits (
  client_key TEXT PRIMARY KEY NOT NULL,
  window_ends_at INTEGER NOT NULL,
  requests INTEGER NOT NULL
);
CREATE INDEX auth_link_request_limits_expiry ON auth_link_request_limits (window_ends_at);

CREATE TABLE seller_api_keys (
  id TEXT PRIMARY KEY NOT NULL,
  org_id TEXT NOT NULL REFERENCES seller_users(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  revoked_at TEXT
);
CREATE INDEX seller_api_keys_org ON seller_api_keys (org_id, created_at DESC);

CREATE TABLE paygate_operations (
  id TEXT PRIMARY KEY NOT NULL,
  org_id TEXT NOT NULL REFERENCES seller_users(id),
  config TEXT NOT NULL CHECK (json_valid(config)),
  auth_cipher TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','paused')),
  revision INTEGER NOT NULL DEFAULT 1,
  tested_revision INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX paygate_operations_org ON paygate_operations (org_id, created_at DESC);

CREATE TABLE paygate_purchases (
  id TEXT PRIMARY KEY NOT NULL,
  operation_id TEXT NOT NULL REFERENCES paygate_operations(id),
  operation_revision INTEGER NOT NULL,
  recovery_hash TEXT NOT NULL,
  snapshot TEXT NOT NULL CHECK (json_valid(snapshot)),
  auth_cipher TEXT,
  input TEXT NOT NULL CHECK (json_valid(input)),
  resource TEXT NOT NULL CHECK (json_valid(resource)),
  requirement TEXT NOT NULL CHECK (json_valid(requirement)),
  state TEXT NOT NULL DEFAULT 'quoted' CHECK (state IN (
    'quoted','settling','payment_unknown','paid','fulfilling',
    'succeeded','failed','upstream_unknown','retryable'
  )),
  authorization_key TEXT UNIQUE,
  evm_authorization TEXT CHECK (json_valid(evm_authorization) OR evm_authorization IS NULL),
  settlement TEXT CHECK (json_valid(settlement) OR settlement IS NULL),
  result TEXT CHECK (json_valid(result) OR result IS NULL),
  upstream_status INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now','+5 minutes'))
);
CREATE INDEX paygate_purchases_activity ON paygate_purchases (operation_id, created_at DESC) WHERE state <> 'quoted';
CREATE INDEX paygate_unpaid_expiry ON paygate_purchases (expires_at) WHERE state = 'quoted';
