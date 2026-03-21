-- invoices テーブル（請求書）
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  candidate_id uuid references candidates(id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'JPY',
  due_date date,
  paid_at timestamptz,
  status text check (status in ('draft','sent','paid','overdue','cancelled')) default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_invoices_updated_at
  before update on invoices
  for each row
  execute function update_updated_at_column();

create index if not exists idx_invoices_company_id on invoices (company_id);
create index if not exists idx_invoices_candidate_id on invoices (candidate_id);
create index if not exists idx_invoices_status on invoices (status);
create index if not exists idx_invoices_due_date on invoices (due_date);

alter table invoices enable row level security;

create policy "全ユーザーが請求書を閲覧可能" on invoices
  for select using (true);

create policy "認証済みユーザーが請求書を登録可能" on invoices
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが請求書を更新可能" on invoices
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが請求書を削除可能" on invoices
  for delete using (auth.role() = 'authenticated');
