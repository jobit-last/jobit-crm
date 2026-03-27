-- diagnoses テーブル（AI市場価値診断）
create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  assessed_by uuid references users(id) on delete set null,
  score numeric(5,2),
  summary text,
  details jsonb,
  status text check (status in ('draft','published','archived')) default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_diagnoses_updated_at
  before update on diagnoses
  for each row
  execute function update_updated_at_column();

create index if not exists idx_diagnoses_candidate_id on diagnoses (candidate_id);
create index if not exists idx_diagnoses_assessed_by on diagnoses (assessed_by);
create index if not exists idx_diagnoses_status on diagnoses (status);

alter table diagnoses enable row level security;

create policy "全ユーザーが診断を閲覧可能" on diagnoses
  for select using (true);

create policy "認証済みユーザーが診断を登録可能" on diagnoses
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが診断を更新可能" on diagnoses
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが診断を削除可能" on diagnoses
  for delete using (auth.role() = 'authenticated');
