-- ポータルユーザー機能: candidates テーブルにカラム追加
-- portal_login_id: PT-XXXX形式の自動採番ログインID
-- portal_active: ポータルアカウントの有効/無効フラグ

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portal_login_id text UNIQUE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portal_active boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_candidates_portal_login_id ON candidates (portal_login_id);
CREATE INDEX IF NOT EXISTS idx_candidates_portal_active ON candidates (portal_active);
