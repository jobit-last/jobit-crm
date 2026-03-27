-- interviews テーブル（面接）
create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  interviewer_id uuid references users(id) on delete set null,
  scheduled_at timestamptz not null,
  mode text check (mode in ('online','onsite','phone')) default 'onsite',
  location text,
  result text,
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_interviews_updated_at
  before update on interviews
  for each row
  execute function update_updated_at_column();

create index if not exists idx_interviews_application_id on interviews (application_id);
create index if not exists idx_interviews_interviewer_id on interviews (interviewer_id);
create index if not exists idx_interviews_scheduled_at on interviews (scheduled_at);

alter table interviews enable row level security;

create policy "全ユーザーが面接を閲覧可能" on interviews
  for select using (true);

create policy "認証済みユーザーが面接を登録可能" on interviews
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーが面接を更新可能" on interviews
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーが面接を削除可能" on interviews
  for delete using (auth.role() = 'authenticated');
