-- companies テーブル
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

-- updated_at 自動更新トリガー
create trigger update_companies_updated_at
  before update on companies
  for each row
  execute function update_updated_at_column();

-- インデックス
create index if not exists idx_companies_name on companies (name);
create index if not exists idx_companies_industry on companies (industry);
create index if not exists idx_companies_temperature on companies (temperature);

-- RLS
alter table companies enable row level security;

create policy "全ユーザーが企業を閲覧可能" on companies
  for select using (true);

create policy "認証済みユーザーが企業を登録可能" on companies
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが企業を更新可能" on companies
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが企業を削除可能" on companies
  for delete using (auth.role() = 'authenticated');
