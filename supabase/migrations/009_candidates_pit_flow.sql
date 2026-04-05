-- 009: PIT Career Flow / PIT App Flow 求職者拡張カラム

-- 流入情報
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source TEXT;  -- 流入元: meta_ad, pit, pit_career, it_school, referral, direct, other
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS form_type TEXT;  -- フォーム種別: pit_career_flow, pit_app_flow, manual
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ad_identifier TEXT;  -- 広告識別子
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- LINE連携
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS line_registered BOOLEAN DEFAULT FALSE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS line_id TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS line_display_name TEXT;

-- 申込・通電管理
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS application_date DATE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS application_time TIME;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS contact_status TEXT DEFAULT 'pending';  -- pending, connected, absent, missed, callback, unreachable
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS contact_attempts INTEGER DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS contact_notes TEXT;

-- 面談管理
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS interview_url TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS interview_type TEXT DEFAULT 'online';  -- online, in_person, phone

-- 個人情報（追加）
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS living_arrangement TEXT;  -- 実家, 独り暮らし, 寮, other
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS prefecture TEXT;  -- 都道府県
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS nearest_station TEXT;  -- 最寄り駅
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS education TEXT;  -- 最終学歴
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS desired_industry TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS desired_job_type TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS available_start_date DATE;  -- 就業可能日

-- 備考・メモ
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS admin_notes TEXT;  -- 管理者メモ

-- インデックス
CREATE INDEX IF NOT EXISTS idx_candidates_source ON candidates(source);
CREATE INDEX IF NOT EXISTS idx_candidates_contact_status ON candidates(contact_status);
CREATE INDEX IF NOT EXISTS idx_candidates_application_date ON candidates(application_date);
CREATE INDEX IF NOT EXISTS idx_candidates_line_registered ON candidates(line_registered);
