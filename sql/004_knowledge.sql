-- knowledge テーブル
create table if not exists knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  category text check (category in ('面接対策', '企業情報', '業界情報', '業務マニュアル')),
  tags text[] default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 自動更新トリガー
create trigger update_knowledge_updated_at
  before update on knowledge
  for each row
  execute function update_updated_at_column();

-- インデックス
create index if not exists idx_knowledge_category on knowledge (category);
create index if not exists idx_knowledge_created_at on knowledge (created_at desc);
create index if not exists idx_knowledge_title on knowledge using gin (to_tsvector('simple', title));

-- RLS
alter table knowledge enable row level security;

create policy "全ユーザーがナレッジを閲覧可能" on knowledge
  for select using (true);

create policy "認証済みユーザーがナレッジを登録可能" on knowledge
  for insert with check (auth.role() = 'authenticated');

create policy "認証済みユーザーがナレッジを更新可能" on knowledge
  for update using (auth.role() = 'authenticated');

create policy "認証済みユーザーがナレッジを削除可能" on knowledge
  for delete using (auth.role() = 'authenticated');
