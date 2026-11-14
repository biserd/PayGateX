CREATE TABLE IF NOT EXISTS auth_login_links (
  email text PRIMARY KEY,
  token_hash text UNIQUE,
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_login_links_expiry_idx ON auth_login_links (expires_at);

CREATE TABLE IF NOT EXISTS auth_link_request_limits (
  client_key text PRIMARY KEY,
  window_ends_at timestamptz NOT NULL,
  requests integer NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_link_request_limits_expiry_idx ON auth_link_request_limits (window_ends_at);
