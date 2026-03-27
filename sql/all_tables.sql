-- ============================================
-- Jobit CRM 全テーブル一括作成SQL
-- Supabase SQL Editor にコピペして「Run」するだけ！
-- ============================================

-- ============================================
-- 0. 共通関数（updated_at自動更新）
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- 1. companies（企業）
-- ============================================
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  company_size text,
  location text,
  website text,
  contact_name text,
  contact_email text,
  contact_phone text,
  temperature text check (temperature in ('HOT', 'WARM', 'COLD')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger update_companies_updated_at
  before update on companies for each row
  execute function update_updated_at_column();

create index if not exists idx_companies_name on companies (name);
create index if not exists idx_companies_industry on companies (industry);
create index if not exists idx_companies_temperature on companies (temperature);

alter table companies enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='companies' and policyname='全ユーザーが企業を閲覧可能') then
    create policy "全ユーザーが企業を閲覧可能" on companies for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='companies' and policyname='認証済みユーザーが企業を登録可能') then
    create policy "認証済みユーザーが企業を登録可能" on companies for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='companies' and policyname='認証済みユーザーが企業を更新可能') then
    create policy "認証済みユーザーが企業を更新可能" on companies for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='companies' and policyname='認証済みユーザーが企業を削除可能') then
    create policy "認証済みユーザーが企業を削除可能" on companies for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 2. jobs（求人）
-- ============================================
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

create or replace trigger update_jobs_updated_at
  before update on jobs for each row
  execute function update_updated_at_column();

create index if not exists idx_jobs_company_id on jobs (company_id);
create index if not exists idx_jobs_title on jobs (title);
create index if not exists idx_jobs_job_type on jobs (job_type);
create index if not exists idx_jobs_location on jobs (location);
create index if not exists idx_jobs_is_published on jobs (is_published);

alter table jobs enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='jobs' and policyname='全ユーザーが求人を閲覧可能') then
    create policy "全ユーザーが求人を閲覧可能" on jobs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='jobs' and policyname='認証済みユーザーが求人を登録可能') then
    create policy "認証済みユーザーが求人を登録可能" on jobs for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='jobs' and policyname='認証済みユーザーが求人を更新可能') then
    create policy "認証済みユーザーが求人を更新可能" on jobs for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='jobs' and policyname='認証済みユーザーが求人を削除可能') then
    create policy "認証済みユーザーが求人を削除可能" on jobs for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 3. candidates（求職者）
-- ============================================
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  status text not null default 'new',
  source text,
  notes text,
  assigned_to uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger update_candidates_updated_at
  before update on candidates for each row
  execute function update_updated_at_column();

create index if not exists idx_candidates_name on candidates (name);
create index if not exists idx_candidates_status on candidates (status);
create index if not exists idx_candidates_assigned_to on candidates (assigned_to);

alter table candidates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='全ユーザーが求職者を閲覧可能') then
    create policy "全ユーザーが求職者を閲覧可能" on candidates for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='認証済みユーザーが求職者を登録可能') then
    create policy "認証済みユーザーが求職者を登録可能" on candidates for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='認証済みユーザーが求職者を更新可能') then
    create policy "認証済みユーザーが求職者を更新可能" on candidates for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='認証済みユーザーが求職者を削除可能') then
    create policy "認証済みユーザーが求職者を削除可能" on candidates for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 4. applications（応募）
-- ============================================
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  status text not null default 'applied',
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger update_applications_updated_at
  before update on applications for each row
  execute function update_updated_at_column();

create index if not exists idx_applications_candidate_id on applications (candidate_id);
create index if not exists idx_applications_job_id on applications (job_id);
create index if not exists idx_applications_status on applications (status);

alter table applications enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='applications' and policyname='全ユーザーが応募を閲覧可能') then
    create policy "全ユーザーが応募を閲覧可能" on applications for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='applications' and policyname='認証済みユーザーが応募を登録可能') then
    create policy "認証済みユーザーが応募を登録可能" on applications for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='applications' and policyname='認証済みユーザーが応募を更新可能') then
    create policy "認証済みユーザーが応募を更新可能" on applications for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='applications' and policyname='認証済みユーザーが応募を削除可能') then
    create policy "認証済みユーザーが応募を削除可能" on applications for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 5. interviews（面接）
-- ============================================
create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  interview_type text,
  scheduled_at timestamptz,
  location text,
  interviewer text,
  result text,
  feedback text,
  created_at timestamptz not null default now()
);

create index if not exists idx_interviews_application_id on interviews (application_id);
create index if not exists idx_interviews_scheduled_at on interviews (scheduled_at);
create index if not exists idx_interviews_result on interviews (result);

alter table interviews enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='interviews' and policyname='全ユーザーが面接を閲覧可能') then
    create policy "全ユーザーが面接を閲覧可能" on interviews for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='interviews' and policyname='認証済みユーザーが面接を登録可能') then
    create policy "認証済みユーザーが面接を登録可能" on interviews for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='interviews' and policyname='認証済みユーザーが面接を更新可能') then
    create policy "認証済みユーザーが面接を更新可能" on interviews for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='interviews' and policyname='認証済みユーザーが面接を削除可能') then
    create policy "認証済みユーザーが面接を削除可能" on interviews for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 6. schedules（スケジュール）
-- ============================================
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  type text,
  candidate_id uuid references candidates(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_schedules_candidate_id on schedules (candidate_id);
create index if not exists idx_schedules_user_id on schedules (user_id);
create index if not exists idx_schedules_scheduled_at on schedules (scheduled_at);
create index if not exists idx_schedules_type on schedules (type);

alter table schedules enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='schedules' and policyname='全ユーザーがスケジュールを閲覧可能') then
    create policy "全ユーザーがスケジュールを閲覧可能" on schedules for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='schedules' and policyname='認証済みユーザーがスケジュールを登録可能') then
    create policy "認証済みユーザーがスケジュールを登録可能" on schedules for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='schedules' and policyname='認証済みユーザーがスケジュールを更新可能') then
    create policy "認証済みユーザーがスケジュールを更新可能" on schedules for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='schedules' and policyname='認証済みユーザーがスケジュールを削除可能') then
    create policy "認証済みユーザーがスケジュールを削除可能" on schedules for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 7. notifications（通知）
-- ============================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  type text not null,
  content text not null,
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_candidate_id on notifications (candidate_id);
create index if not exists idx_notifications_type on notifications (type);
create index if not exists idx_notifications_status on notifications (status);

alter table notifications enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='全ユーザーが通知を閲覧可能') then
    create policy "全ユーザーが通知を閲覧可能" on notifications for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='認証済みユーザーが通知を登録可能') then
    create policy "認証済みユーザーが通知を登録可能" on notifications for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='認証済みユーザーが通知を更新可能') then
    create policy "認証済みユーザーが通知を更新可能" on notifications for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='認証済みユーザーが通知を削除可能') then
    create policy "認証済みユーザーが通知を削除可能" on notifications for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 8. invoices（請求書）
-- ============================================
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete set null,
  amount integer not null,
  invoice_date date not null,
  due_date date not null,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_invoices_company_id on invoices (company_id);
create index if not exists idx_invoices_candidate_id on invoices (candidate_id);
create index if not exists idx_invoices_status on invoices (status);
create index if not exists idx_invoices_due_date on invoices (due_date);

alter table invoices enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='invoices' and policyname='全ユーザーが請求書を閲覧可能') then
    create policy "全ユーザーが請求書を閲覧可能" on invoices for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='invoices' and policyname='認証済みユーザーが請求書を登録可能') then
    create policy "認証済みユーザーが請求書を登録可能" on invoices for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='invoices' and policyname='認証済みユーザーが請求書を更新可能') then
    create policy "認証済みユーザーが請求書を更新可能" on invoices for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='invoices' and policyname='認証済みユーザーが請求書を削除可能') then
    create policy "認証済みユーザーが請求書を削除可能" on invoices for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 9. knowledge（ナレッジ）
-- ============================================
create table if not exists knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  category text check (category in ('面接対策', '企業情報', '業界情報', '業務マニュアル')),
  tags text[] default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger update_knowledge_updated_at
  before update on knowledge for each row
  execute function update_updated_at_column();

create index if not exists idx_knowledge_category on knowledge (category);
create index if not exists idx_knowledge_created_at on knowledge (created_at desc);

alter table knowledge enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='knowledge' and policyname='全ユーザーがナレッジを閲覧可能') then
    create policy "全ユーザーがナレッジを閲覧可能" on knowledge for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='knowledge' and policyname='認証済みユーザーがナレッジを登録可能') then
    create policy "認証済みユーザーがナレッジを登録可能" on knowledge for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='knowledge' and policyname='認証済みユーザーがナレッジを更新可能') then
    create policy "認証済みユーザーがナレッジを更新可能" on knowledge for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='knowledge' and policyname='認証済みユーザーがナレッジを削除可能') then
    create policy "認証済みユーザーがナレッジを削除可能" on knowledge for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 10. diagnoses（診断）
-- ============================================
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

create index if not exists idx_diagnoses_candidate_id on diagnoses (candidate_id);
create index if not exists idx_diagnoses_score on diagnoses (score);

alter table diagnoses enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='diagnoses' and policyname='全ユーザーが診断を閲覧可能') then
    create policy "全ユーザーが診断を閲覧可能" on diagnoses for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='diagnoses' and policyname='認証済みユーザーが診断を登録可能') then
    create policy "認証済みユーザーが診断を登録可能" on diagnoses for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='diagnoses' and policyname='認証済みユーザーが診断を更新可能') then
    create policy "認証済みユーザーが診断を更新可能" on diagnoses for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='diagnoses' and policyname='認証済みユーザーが診断を削除可能') then
    create policy "認証済みユーザーが診断を削除可能" on diagnoses for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 11. resumes（履歴書）
-- ============================================
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  content_json jsonb,
  pdf_url text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger update_resumes_updated_at
  before update on resumes for each row
  execute function update_updated_at_column();

create index if not exists idx_resumes_candidate_id on resumes (candidate_id);

alter table resumes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resumes' and policyname='全ユーザーが履歴書を閲覧可能') then
    create policy "全ユーザーが履歴書を閲覧可能" on resumes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='resumes' and policyname='認証済みユーザーが履歴書を登録可能') then
    create policy "認証済みユーザーが履歴書を登録可能" on resumes for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='resumes' and policyname='認証済みユーザーが履歴書を更新可能') then
    create policy "認証済みユーザーが履歴書を更新可能" on resumes for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='resumes' and policyname='認証済みユーザーが履歴書を削除可能') then
    create policy "認証済みユーザーが履歴書を削除可能" on resumes for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 12. contracts（契約書）
-- ============================================
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  content text,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired')),
  start_date date,
  end_date date,
  file_url text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger update_contracts_updated_at
  before update on contracts for each row
  execute function update_updated_at_column();

create index if not exists idx_contracts_company_id on contracts (company_id);
create index if not exists idx_contracts_status on contracts (status);

alter table contracts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='contracts' and policyname='全ユーザーが契約書を閲覧可能') then
    create policy "全ユーザーが契約書を閲覧可能" on contracts for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='contracts' and policyname='認証済みユーザーが契約書を登録可能') then
    create policy "認証済みユーザーが契約書を登録可能" on contracts for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='contracts' and policyname='認証済みユーザーが契約書を更新可能') then
    create policy "認証済みユーザーが契約書を更新可能" on contracts for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='contracts' and policyname='認証済みユーザーが契約書を削除可能') then
    create policy "認証済みユーザーが契約書を削除可能" on contracts for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 13. memorandums（覚書）
-- ============================================
create table if not exists memorandums (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  title text not null,
  content text,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired')),
  signed_date date,
  file_url text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger update_memorandums_updated_at
  before update on memorandums for each row
  execute function update_updated_at_column();

create index if not exists idx_memorandums_company_id on memorandums (company_id);
create index if not exists idx_memorandums_contract_id on memorandums (contract_id);
create index if not exists idx_memorandums_status on memorandums (status);

alter table memorandums enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='memorandums' and policyname='全ユーザーが覚書を閲覧可能') then
    create policy "全ユーザーが覚書を閲覧可能" on memorandums for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='memorandums' and policyname='認証済みユーザーが覚書を登録可能') then
    create policy "認証済みユーザーが覚書を登録可能" on memorandums for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='memorandums' and policyname='認証済みユーザーが覚書を更新可能') then
    create policy "認証済みユーザーが覚書を更新可能" on memorandums for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='memorandums' and policyname='認証済みユーザーが覚書を削除可能') then
    create policy "認証済みユーザーが覚書を削除可能" on memorandums for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 14. activity_logs（操作ログ）
-- ============================================
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  action text not null,
  target text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_user_id on activity_logs (user_id);
create index if not exists idx_activity_logs_action on activity_logs (action);
create index if not exists idx_activity_logs_created_at on activity_logs (created_at desc);

alter table activity_logs enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='activity_logs' and policyname='全ユーザーがログを閲覧可能') then
    create policy "全ユーザーがログを閲覧可能" on activity_logs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='activity_logs' and policyname='認証済みユーザーがログを登録可能') then
    create policy "認証済みユーザーがログを登録可能" on activity_logs for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================
-- 完了！
-- ============================================
