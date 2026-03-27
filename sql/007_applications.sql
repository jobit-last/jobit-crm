-- applications テーブル（選考）
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  status text check (status in ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')) default 'applied',
  applied_at timestamptz not null default now(),
  result text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_applications_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

create index if not exists idx_applications_candidate_id on applications (candidate_id);
create index if not exists idx_applications_job_id on applications (job_id);
create index if not exists idx_applications_company_id on applications (company_id);
create index if not exists idx_applications_status on applications (status);

alter table applications enable row level security;

create policy "全ユーザーが選考を閲覧可能" on applications
  for select using (true);

create policy "認証済みユーザーが選考を登録可能" on applications
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが選考を更新可能" on applications
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが選考を削除可能" on applications
  for delete using (auth.role() = 'authenticated');
