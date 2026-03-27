# Jobit CRM — 転職支援CRMシステム 要件定義書

## 1. プロジェクト概要

### 1.1 システム名
Jobit CRM（ジョビット シーアールエム）

### 1.2 目的
転職支援事業における求職者・企業・求人案件の一元管理を実現し、キャリアアドバイザー（CA）の業務効率化と成約率向上を支援するCRMシステムを構築する。

### 1.3 対象ユーザー
| ロール | 説明 |
|--------|------|
| admin | システム管理者。全機能にアクセス可能 |
| manager | マネージャー。チーム全体のデータ閲覧・レポート機能 |
| advisor | キャリアアドバイザー（CA）。求職者対応・マッチング業務 |

### 1.4 技術スタック
| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| バックエンド / BaaS | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| 認証 | Supabase Auth (Email/Password) |
| ホスティング | Vercel |
| その他 | ESLint, Prettier |

---

## 2. 機能要件

### 2.1 認証・認可
- メールアドレス＋パスワードによるログイン
- ロールベースアクセス制御（RBAC）: admin / manager / advisor
- セッション管理（Supabase Auth）
- パスワードリセット機能
- ログイン履歴の記録

### 2.2 求職者（Candidate）管理
- 求職者の新規登録・編集・削除（論理削除）
- 基本情報: 氏名、フリガナ、生年月日、性別、メールアドレス、電話番号、住所
- 職歴情報: 現職企業名、業界、職種、年収、経験年数
- 希望条件: 希望業界、希望職種、希望年収、希望勤務地、転職時期
- ステータス管理: 新規登録 → 面談済み → 案件紹介中 → 選考中 → 内定 → 入社 / 辞退
- 担当CA割り当て
- 対応履歴（アクティビティログ）
- 履歴書・職務経歴書のファイルアップロード（Supabase Storage）
- 検索・フィルタリング（名前、ステータス、担当CA等）

### 2.3 企業（Company）管理
- 企業の新規登録・編集・削除（論理削除）
- 基本情報: 企業名、業界、所在地、従業員数、設立年、URL
- 担当者情報: 氏名、部署、役職、メールアドレス、電話番号
- 契約ステータス: 見込み → 契約中 → 休止 → 解約
- 企業に紐づく求人一覧の表示
- 対応履歴（アクティビティログ）

### 2.4 求人案件（Job）管理
- 求人の新規登録・編集・削除（論理削除）
- 紐づけ企業（必須）
- 募集情報: 職種名、業界、雇用形態、年収範囲（min/max）、勤務地、仕事内容
- 応募条件: 必須スキル、歓迎スキル、経験年数
- 求人ステータス: 募集中 → 選考中 → 充足 → 募集終了
- 応募者（Candidate）一覧の表示

### 2.5 マッチング・選考管理（Application）
- 求職者 × 求人のマッチング（紐づけ）
- 選考ステータス管理: 書類選考 → 一次面接 → 二次面接 → 最終面接 → 内定 → 入社 / 辞退
- 各選考ステップの日時・結果・メモの記録
- 面接日程の管理
- 内定条件（年収、入社日等）の記録

### 2.6 アクティビティ・対応履歴
- 求職者・企業に対する全アクション（電話、メール、面談、メモ等）の記録
- アクティビティ種別: 電話（発信/着信）、メール、面談、メモ、その他
- タイムライン表示

### 2.7 ダッシュボード
- 担当求職者数（ステータス別）
- 進行中の選考数
- 今月の内定数・入社数
- 直近のアクティビティ一覧
- KPIサマリー（マネージャー・管理者向け）

### 2.8 レポート・分析（Phase 2）
- 月次レポート（成約数、売上見込み等）
- CA別パフォーマンスレポート
- 企業別採用実績
- CSV/Excelエクスポート

---

## 3. 非機能要件

### 3.1 パフォーマンス
- 主要画面の初期表示: 2秒以内
- 一覧画面のページネーション: 1ページ50件

### 3.2 セキュリティ
- Supabase RLS（Row Level Security）によるデータアクセス制御
- HTTPS通信の強制
- パスワードポリシー: 8文字以上、英数字混合
- セッションタイムアウト: 24時間

### 3.3 可用性
- Vercel + Supabase のマネージドインフラを利用
- 目標稼働率: 99.5%

### 3.4 スケーラビリティ
- 初期想定: 求職者10,000件、企業1,000件、求人5,000件
- Supabase の接続プーリング利用

---

## 4. 画面一覧

| # | 画面名 | パス | 説明 |
|---|--------|------|------|
| 1 | ログイン | /login | メール＋パスワードログイン |
| 2 | ダッシュボード | /dashboard | KPI・統計サマリー |
| 3 | 求職者一覧 | /candidates | 検索・フィルタ付き一覧 |
| 4 | 求職者詳細 | /candidates/[id] | 基本情報・職歴・選考・アクティビティ |
| 5 | 求職者登録/編集 | /candidates/new, /candidates/[id]/edit | フォーム |
| 6 | 企業一覧 | /companies | 検索・フィルタ付き一覧 |
| 7 | 企業詳細 | /companies/[id] | 基本情報・担当者・求人一覧 |
| 8 | 企業登録/編集 | /companies/new, /companies/[id]/edit | フォーム |
| 9 | 求人一覧 | /jobs | 検索・フィルタ付き一覧 |
| 10 | 求人詳細 | /jobs/[id] | 募集情報・応募者一覧 |
| 11 | 求人登録/編集 | /jobs/new, /jobs/[id]/edit | フォーム |
| 12 | 選考管理 | /applications | カンバンボード形式 |
| 13 | 設定 | /settings | ユーザー管理（admin）、プロフィール |

---

## 5. デザイン仕様

### 5.1 カラーパレット
| 用途 | カラーコード | 説明 |
|------|-------------|------|
| メインカラー | #002D37 | ダークティール。ヘッダー・サイドバー・ボタン等 |
| サブカラー | #00A0B0 | アクセントカラー。リンク・アイコン・ホバー |
| 背景色 | #F5F7FA | ページ全体の背景 |
| カード背景 | #FFFFFF | カード・モーダルの背景 |
| テキスト（主） | #1A1A2E | 見出し・本文 |
| テキスト（副） | #6B7280 | 補足テキスト・ラベル |
| 成功 | #10B981 | 成功通知・完了ステータス |
| 警告 | #F59E0B | 注意喚起 |
| エラー | #EF4444 | エラー通知・必須入力 |

### 5.2 レイアウト
- サイドバーナビゲーション（固定幅 240px）
- ヘッダーバー（ユーザー情報・通知）
- メインコンテンツエリア（レスポンシブ）
- フォントファミリー: Inter / Noto Sans JP

---

## 6. 主要DBテーブル設計

### 6.1 profiles（ユーザープロフィール）
| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | uuid (PK) | Supabase Auth の user_id と連携 |
| email | text | メールアドレス |
| full_name | text | 氏名 |
| role | text | admin / manager / advisor |
| avatar_url | text | プロフィール画像URL |
| is_active | boolean | 有効/無効 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### 6.2 candidates（求職者）
| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | uuid (PK) | |
| first_name | text | 名 |
| last_name | text | 姓 |
| first_name_kana | text | 名（カナ） |
| last_name_kana | text | 姓（カナ） |
| email | text | メールアドレス |
| phone | text | 電話番号 |
| birth_date | date | 生年月日 |
| gender | text | 性別 (male/female/other) |
| postal_code | text | 郵便番号 |
| address | text | 住所 |
| current_company | text | 現職企業名 |
| current_industry | text | 現在の業界 |
| current_job_type | text | 現在の職種 |
| current_salary | integer | 現年収（万円） |
| experience_years | integer | 経験年数 |
| desired_industry | text | 希望業界 |
| desired_job_type | text | 希望職種 |
| desired_salary_min | integer | 希望年収（下限・万円） |
| desired_salary_max | integer | 希望年収（上限・万円） |
| desired_location | text | 希望勤務地 |
| desired_start_date | text | 転職希望時期 |
| status | text | ステータス |
| assigned_advisor_id | uuid (FK → profiles.id) | 担当CA |
| notes | text | 備考 |
| resume_url | text | 履歴書ファイルURL |
| cv_url | text | 職務経歴書ファイルURL |
| is_deleted | boolean | 論理削除フラグ |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### 6.3 companies（企業）
| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | uuid (PK) | |
| name | text | 企業名 |
| industry | text | 業界 |
| address | text | 所在地 |
| employee_count | integer | 従業員数 |
| established_year | integer | 設立年 |
| website_url | text | 企業サイトURL |
| contact_name | text | 担当者氏名 |
| contact_department | text | 担当者部署 |
| contact_position | text | 担当者役職 |
| contact_email | text | 担当者メール |
| contact_phone | text | 担当者電話番号 |
| contract_status | text | 契約ステータス |
| notes | text | 備考 |
| is_deleted | boolean | 論理削除フラグ |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### 6.4 jobs（求人案件）
| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies.id) | 企業 |
| title | text | 求人タイトル |
| job_type | text | 職種 |
| industry | text | 業界 |
| employment_type | text | 雇用形態 (full_time/contract/part_time) |
| salary_min | integer | 年収下限（万円） |
| salary_max | integer | 年収上限（万円） |
| location | text | 勤務地 |
| description | text | 仕事内容 |
| required_skills | text | 必須スキル |
| preferred_skills | text | 歓迎スキル |
| required_experience_years | integer | 必要経験年数 |
| status | text | ステータス |
| is_deleted | boolean | 論理削除フラグ |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### 6.5 applications（選考）
| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | uuid (PK) | |
| candidate_id | uuid (FK → candidates.id) | 求職者 |
| job_id | uuid (FK → jobs.id) | 求人 |
| status | text | 選考ステータス |
| interview_date | timestamptz | 面接日時 |
| offered_salary | integer | 提示年収（万円） |
| offered_start_date | date | 提示入社日 |
| notes | text | メモ |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### 6.6 activities（対応履歴）
| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | uuid (PK) | |
| type | text | 種別 (call_outgoing/call_incoming/email/meeting/note/other) |
| candidate_id | uuid (FK → candidates.id, nullable) | 関連求職者 |
| company_id | uuid (FK → companies.id, nullable) | 関連企業 |
| user_id | uuid (FK → profiles.id) | 記録者 |
| title | text | タイトル |
| content | text | 内容 |
| activity_date | timestamptz | アクティビティ日時 |
| created_at | timestamptz | 作成日時 |

---

## 7. 開発フェーズ

### Phase 1（MVP）
- 認証（ログイン/ログアウト）
- 求職者CRUD
- 企業CRUD
- 求人案件CRUD
- 基本的なダッシュボード

### Phase 2
- マッチング・選考管理
- アクティビティ記録
- 詳細ダッシュボード・KPI

### Phase 3
- レポート・分析
- CSV/Excelエクスポート
- 通知機能
- 高度な検索・フィルタリング

---

## 8. 更新履歴

| 日付 | バージョン | 内容 |
|------|-----------|------|
| 2026-03-19 | 1.0 | 初版作成 |
