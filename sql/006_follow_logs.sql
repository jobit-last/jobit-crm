-- follow_logs テーブル
create table if not exists follow_logs (
  id           uuid        primary key default gen_random_uuid(),
  candidate_id uuid        not null references candidates(id) on delete cascade,
  template_id  uuid        references message_templates(id) on delete set null,
  type         text        not null check (type in ('面談リマインド', '面接リマインド', '入社後フォロー', 'リサポ連絡')),
  content      text        not null,
  status       text        not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- インデックス
create index if not exists idx_follow_logs_candidate_id on follow_logs (candidate_id);
create index if not exists idx_follow_logs_template_id  on follow_logs (template_id);
create index if not exists idx_follow_logs_type         on follow_logs (type);
create index if not exists idx_follow_logs_status       on follow_logs (status);
create index if not exists idx_follow_logs_created_at   on follow_logs (created_at desc);

-- RLS
alter table follow_logs enable row level security;

create policy "認証済みユーザーが送信履歴を閲覧可能" on follow_logs
  for select using (auth.role() = 'authenticated');

create policy "認証済みユーザーが送信履歴を登録可能" on follow_logs
  for insert with check (auth.role() = 'authenticated');

-- 送信履歴は更新・削除不可（ログの改ざん防止）
-- 必要に応じて管理者のみ許可する場合は以下を追加:
-- create policy "管理者のみ送信履歴を削除可能" on follow_logs
--   for delete using (auth.jwt() ->> 'role' = 'admin');
