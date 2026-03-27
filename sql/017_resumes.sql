-- =============================================================
-- 履歴書管理テーブル
-- =============================================================

CREATE TABLE IF NOT EXISTS resumes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  version        integer NOT NULL DEFAULT 1,
  title          text NOT NULL DEFAULT '履歴書',
  content        jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_ai_generated boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- updated_at 自動更新トリガー
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- インデックス
CREATE INDEX idx_resumes_candidate_id ON resumes (candidate_id);
CREATE INDEX idx_resumes_version ON resumes (candidate_id, version DESC);

-- RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resumes_select" ON resumes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "resumes_insert" ON resumes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "resumes_update" ON resumes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "resumes_delete" ON resumes
  FOR DELETE TO authenticated USING (true);
