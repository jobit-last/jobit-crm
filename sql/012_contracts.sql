-- contracts テーブル（契約書）
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  candidate_id uuid references candidates(id) on delete set null,
  start_date date,
  end_date date,
  amount numeric(12,2),
  status text check (status in ('draft','active','expired','terminated')) default 'draft',
  agreement_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_contracts_updated_at
  before update on contracts
  for each row
  execute function update_updated_at_column();

create index if not exists idx_contracts_company_id on contracts (company_id);
create index if not exists idx_contracts_candidate_id on contracts (candidate_id);
create index if not exists idx_contracts_status on contracts (status);
create index if not exists idx_contracts_start_date on contracts (start_date);

alter table contracts enable row level security;

create policy "全ユーザーが契約書を閲覧可能" on contracts
  for select using (true);

create policy "認証済みユーザーが契約書を登録可能" on contracts
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが契約書を更新可能" on contracts
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが契約書を削除可能" on contracts
  for delete using (auth.role() = 'authenticated');
