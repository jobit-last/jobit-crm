-- notifications テーブル（通知）
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  message text,
  link text,
  is_read boolean not null default false,
  type text check (type in ('info','success','warning','error','action')) default 'info',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_notifications_updated_at
  before update on notifications
  for each row
  execute function update_updated_at_column();

create index if not exists idx_notifications_user_id on notifications (user_id);
create index if not exists idx_notifications_is_read on notifications (is_read);
create index if not exists idx_notifications_type on notifications (type);

alter table notifications enable row level security;

create policy "全ユーザーが通知を閲覧可能" on notifications
  for select using (true);

create policy "認証済みユーザーが通知を登録可能" on notifications
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが通知を更新可能" on notifications
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが通知を削除可能" on notifications
  for delete using (auth.role() = 'authenticated');
