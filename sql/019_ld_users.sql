-- LD ユーザーのログインID列を追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS ld_login_id text UNIQUE;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_users_ld_login_id ON users (ld_login_id) WHERE ld_login_id IS NOT NULL;
