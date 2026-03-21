-- resumes テーブル
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  content_json jsonb,
  pdf_url text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 自動更新トリガー
create trigger update_resumes_updated_at
  before update on resumes
  for each row
  execute function update_updated_at_column();

-- インデックス
create index if not exists idx_resumes_candidate_id on resumes (candidate_id);

-- RLS
alter table resumes enable row level security;

create policy "全ユーザーが履歴書を閲覧可能" on resumes
  for select using (true);

create policy "認証済みユーザーが履歴書を登録可能" on resumes
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが履歴書を更新可能" on resumes
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが履歴書を削除可能" on resumes
  for delete using (auth.role() = 'authenticated');
