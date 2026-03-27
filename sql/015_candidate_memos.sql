-- candidate_memos テーブル（求職者メモ）
create table if not exists candidate_memos (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  created_by uuid references users(id) on delete set null,
  memo text,
  memo_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_candidate_memos_updated_at
  before update on candidate_memos
  for each row
  execute function update_updated_at_column();

create index if not exists idx_candidate_memos_candidate_id on candidate_memos (candidate_id);
create index if not exists idx_candidate_memos_created_by on candidate_memos (created_by);

alter table candidate_memos enable row level security;

create policy "全ユーザーが求職者メモを閲覧可能" on candidate_memos
  for select using (true);

create policy "認証済みユーザーが求職者メモを登録可能" on candidate_memos
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが求職者メモを更新可能" on candidate_memos
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが求職者メモを削除可能" on candidate_memos
  for delete using (auth.role() = 'authenticated');
