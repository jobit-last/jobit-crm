-- notifications テーブル
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  type text not null,
  content text not null,
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- インデックス
create index if not exists idx_notifications_candidate_id on notifications (candidate_id);
create index if not exists idx_notifications_type on notifications (type);
create index if not exists idx_notifications_status on notifications (status);

-- RLS
alter table notifications enable row level security;

create policy "全ユーザーが通知を閲覧可能" on notifications
  for select using (true);

create policy "認証済みユーザーが通知を登録可能" on notifications
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが通知を更新可能" on notifications
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが通知を削除可能" on notifications
  for delete using (auth.role() = 'authenticated');
