-- activity_logs テーブル（操作ログ）
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_activity_logs_updated_at
  before update on activity_logs
  for each row
  execute function update_updated_at_column();

create index if not exists idx_activity_logs_user_id on activity_logs (user_id);
create index if not exists idx_activity_logs_performed_at on activity_logs (performed_at desc);
create index if not exists idx_activity_logs_target_table on activity_logs (target_table);

alter table activity_logs enable row level security;

create policy "全ユーザーが操作ログを閲覧可能" on activity_logs
  for select using (true);

create policy "認証済みユーザーが操作ログを登録可能" on activity_logs
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが操作ログを更新可能" on activity_logs
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが操作ログを削除可能" on activity_logs
  for delete using (auth.role() = 'authenticated');
