-- message_templates テーブル
create table if not exists message_templates (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  type        text        not null check (type in ('LINE', 'SMS', 'email')),
  content     text        not null,
  variables   text[]      default '{}',
  created_by  uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at 自動更新トリガー
create trigger update_message_templates_updated_at
  before update on message_templates
  for each row
  execute function update_updated_at_column();

-- インデックス
create index if not exists idx_message_templates_type       on message_templates (type);
create index if not exists idx_message_templates_created_by on message_templates (created_by);
create index if not exists idx_message_templates_created_at on message_templates (created_at desc);
create index if not exists idx_message_templates_name       on message_templates using gin (to_tsvector('simple', name));

-- RLS
alter table message_templates enable row level security;

create policy "認証済みユーザーがテンプレートを閲覧可能" on message_templates
  for select using (auth.role() = 'authenticated');

create policy "認証済みユーザーがテンプレートを登録可能" on message_templates
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーがテンプレートを更新可能" on message_templates
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーがテンプレートを削除可能" on message_templates
  for delete using (auth.role() = 'authenticated');
