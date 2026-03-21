-- ============================================================
-- usersテーブル RLSポリシー修正 & テストユーザー登録
-- ============================================================

-- 1. 既存のRLSポリシーを全て削除（無限再帰の原因）
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
  END LOOP;
END;
$$;

-- 2. 正しいRLSポリシーを作成（auth.uid()を直接使い再帰を回避）
CREATE POLICY "認証済みユーザーがユーザー一覧を閲覧可能"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "認証済みユーザーがユーザーを登録可能"
  ON users FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "認証済みユーザーがユーザーを更新可能"
  ON users FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "認証済みユーザーがユーザーを削除可能"
  ON users FOR DELETE
  USING (auth.role() = 'authenticated');

-- 3. activity_logsテーブルのRLSポリシーも確認・修正
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'activity_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON activity_logs', pol.policyname);
  END LOOP;
END;
$$;

CREATE POLICY "認証済みユーザーがログを閲覧可能"
  ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "認証済みユーザーがログを登録可能"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 4. 既存のAuthユーザーをusersテーブルに登録（未登録の場合）
INSERT INTO users (id, name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.email,
  'admin'
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE u.id IS NULL;
