-- jobs テーブル
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  description text,
  job_type text,
  location text,
  salary_min integer,
  salary_max integer,
  required_skills text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 自動更新トリガー
create trigger update_jobs_updated_at
  before update on jobs
  for each row
  execute function update_updated_at_column();

-- インデックス
create index if not exists idx_jobs_company_id on jobs (company_id);
create index if not exists idx_jobs_title on jobs (title);
create index if not exists idx_jobs_job_type on jobs (job_type);
create index if not exists idx_jobs_location on jobs (location);
create index if not exists idx_jobs_is_published on jobs (is_published);

-- RLS
alter table jobs enable row level security;

create policy "全ユーザーが求人を閲覧可能" on jobs
  for select using (true);

create policy "認証済みユーザーが求人を登録可能" on jobs
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが求人を更新可能" on jobs
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが求人を削除可能" on jobs
  for delete using (auth.role() = 'authenticated');
