-- PIT連携用カラム追加
-- pit_user_id: PIT管理コンソール上のユーザーID（重複防止用）
-- pit_synced_at: PIT連携日時

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS pit_user_id integer UNIQUE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS pit_synced_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_candidates_pit_user_id ON candidates(pit_user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON candidates(source);

COMMENT ON COLUMN candidates.pit_user_id IS 'PIT管理コンソールのユーザーID';
COMMENT ON COLUMN candidates.pit_synced_at IS 'PITから同期された日時';
