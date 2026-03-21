-- diagnoses テーブル
create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  score integer,
  salary_min integer,
  salary_max integer,
  strengths text,
  weaknesses text,
  advice text,
  result_json jsonb,
  created_at timestamptz not null default now()
);

-- インデックス
create index if not exists idx_diagnoses_candidate_id on diagnoses (candidate_id);
create index if not exists idx_diagnoses_score on diagnoses (score);

-- RLS
alter table diagnoses enable row level security;

create policy "全ユーザーが診断を閲覧可能" on diagnoses
  for select using (true);

create policy "認証済みユーザーが診断を登録可能" on diagnoses
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが診断を更新可能" on diagnoses
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが診断を削除可能" on diagnoses
  for delete using (auth.role() = 'authenticated');
