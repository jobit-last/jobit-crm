-- candidates テーブル（求職者）
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  current_company text,
  current_position text,
  skills text[],
  experience_years integer,
  status text check (status in ('active','inactive','placed','archived')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_candidates_updated_at
  before update on candidates
  for each row
  execute function update_updated_at_column();

create index if not exists idx_candidates_user_id on candidates (user_id);
create index if not exists idx_candidates_email on candidates (email);
create index if not exists idx_candidates_status on candidates (status);

alter table candidates enable row level security;

create policy "全ユーザーが求職者を閲覧可能" on candidates
  for select using (true);

create policy "認証済みユーザーが求職者を登録可能" on candidates
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが求職者を更新可能" on candidates
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが求職者を削除可能" on candidates
  for delete using (auth.role() = 'authenticated');
