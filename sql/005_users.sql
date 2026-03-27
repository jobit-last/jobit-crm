-- users テーブル（CAと管理者）
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text not null check (role in ('ca', 'admin')),
  company_id uuid references companies(id) on delete set null,
  phone text,
  status text check (status in ('active','inactive','suspended')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();

create index if not exists idx_users_email on users (email);
create index if not exists idx_users_role on users (role);
create index if not exists idx_users_company_id on users (company_id);

alter table users enable row level security;

create policy "全ユーザーがユーザー情報を閲覧可能" on users
  for select using (true);

create policy "認証済みユーザーがユーザーを登録可能" on users
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーがユーザーを更新可能" on users
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーがユーザーを削除可能" on users
  for delete using (auth.role() = 'authenticated');
