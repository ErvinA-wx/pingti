CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('site', 'request')),
  payload_json TEXT NOT NULL,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notification_status TEXT NOT NULL DEFAULT 'pending',
  user_agent TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
  ON submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_kind_status
  ON submissions (kind, status);
