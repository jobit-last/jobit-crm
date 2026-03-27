-- memorandums テーブル（覚書）
create table if not exists memorandums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  created_by uuid references users(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  candidate_id uuid references candidates(id) on delete set null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_memorandums_updated_at
  before update on memorandums
  for each row
  execute function update_updated_at_column();

create index if not exists idx_memorandums_created_by on memorandums (created_by);
create index if not exists idx_memorandums_company_id on memorandums (company_id);
create index if not exists idx_memorandums_candidate_id on memorandums (candidate_id);
create index if not exists idx_memorandums_category on memorandums (category);

alter table memorandums enable row level security;

create policy "全ユーザーが覚書を閲覧可能" on memorandums
  for select using (true);

create policy "認証済みユーザーが覚書を登録可能" on memorandums
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが覚書を更新可能" on memorandums
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが覚書を削除可能" on memorandums
  for delete using (auth.role() = 'authenticated');
