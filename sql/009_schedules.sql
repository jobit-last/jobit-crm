-- schedules テーブル（スケジュール）
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  candidate_id uuid references candidates(id) on delete set null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_all_day boolean not null default false,
  status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_schedules_updated_at
  before update on schedules
  for each row
  execute function update_updated_at_column();

create index if not exists idx_schedules_user_id on schedules (user_id);
create index if not exists idx_schedules_candidate_id on schedules (candidate_id);
create index if not exists idx_schedules_start_at on schedules (start_at);

alter table schedules enable row level security;

create policy "全ユーザーがスケジュールを閲覧可能" on schedules
  for select using (true);

create policy "認証済みユーザーがスケジュールを登録可能" on schedules
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーがスケジュールを更新可能" on schedules
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーがスケジュールを削除可能" on schedules
  for delete using (auth.role() = 'authenticated');
