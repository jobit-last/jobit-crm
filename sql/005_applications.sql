-- applications テーブル
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  status text not null default 'applied',
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 自動更新トリガー
create trigger update_applications_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

-- インデックス
create index if not exists idx_applications_candidate_id on applications (candidate_id);
create index if not exists idx_applications_job_id on applications (job_id);
create index if not exists idx_applications_status on applications (status);

-- RLS
alter table applications enable row level security;

create policy "全ユーザーが応募を閲覧可能" on applications
  for select using (true);

create policy "認証済みユーザーが応募を登録可能" on applications
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが応募を更新可能" on applications
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが応募を削除可能" on applications
  for delete using (auth.role() = 'authenticated');
