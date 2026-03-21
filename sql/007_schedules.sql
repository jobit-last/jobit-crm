-- schedules テーブル
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  type text,
  candidate_id uuid references candidates(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

-- インデックス
create index if not exists idx_schedules_candidate_id on schedules (candidate_id);
create index if not exists idx_schedules_user_id on schedules (user_id);
create index if not exists idx_schedules_scheduled_at on schedules (scheduled_at);
create index if not exists idx_schedules_type on schedules (type);

-- RLS
alter table schedules enable row level security;

create policy "全ユーザーがスケジュールを閲覧可能" on schedules
  for select using (true);

create policy "認証済みユーザーがスケジュールを登録可能" on schedules
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーがスケジュールを更新可能" on schedules
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーがスケジュールを削除可能" on schedules
  for delete using (auth.role() = 'authenticated');
