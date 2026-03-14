-- Migration: Create token_blacklist table
-- Purpose: JWT token revocation and immediate logout capability
-- Date: 2025-03-14

CREATE TABLE IF NOT EXISTS token_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_type VARCHAR(20) NOT NULL DEFAULT 'access',
  reason VARCHAR(50) NOT NULL DEFAULT 'logout',
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_by_ip VARCHAR(45)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Comment
COMMENT ON TABLE token_blacklist IS 'Stores revoked JWT tokens to prevent reuse after logout or compromise';
COMMENT ON COLUMN token_blacklist.token_hash IS 'SHA-256 hash of the revoked token';
COMMENT ON COLUMN token_blacklist.token_type IS 'Type of token: access or refresh';
COMMENT ON COLUMN token_blacklist.reason IS 'Reason for revocation: logout, revoked, expired';
