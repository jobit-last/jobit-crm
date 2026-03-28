// =============================================================
// 求職者管理 型定義
// =============================================================

// メインステータス（パイプライン順）
export type CandidateStatus =
  | "applied"              // 応募
  | "setup"                // 設置
  | "conducted"            // 実施
  | "supporting"           // サポート中
  | "offered"              // 内定
  | "offer_accepted"       // 内定承諾
  | "placed"               // 入社
  // サブステータス（離脱理由）
  | "conducted_noshow"     // 実施後：トビ
  | "conducted_declined"   // 実施後：辞退
  | "support_noshow"       // サポート後：トビ
  | "support_declined"     // サポート後：辞退
  | "support_released"     // サポート後：リリース
  | "offer_noshow"         // 内定後：トビ
  | "offer_declined"       // 内定後：辞退
  | "accepted_noshow"      // 承諾後：トビ
  | "accepted_declined";   // 承諾後：辞退

// メインステータスのみ（パイプライン用）
export const MAIN_STATUSES: CandidateStatus[] = [
  "applied", "setup", "conducted", "supporting",
  "offered", "offer_accepted", "placed",
];

// サブステータス（離脱理由）
export const SUB_STATUSES: CandidateStatus[] = [
  "conducted_noshow", "conducted_declined",
  "support_noshow", "support_declined", "support_released",
  "offer_noshow", "offer_declined",
  "accepted_noshow", "accepted_declined",
];

// 各ステージの離脱サブステータス
export const STAGE_SUB_STATUSES: Record<string, CandidateStatus[]> = {
  conducted: ["conducted_noshow", "conducted_declined"],
  supporting: ["support_noshow", "support_declined", "support_released"],
  offered: ["offer_noshow", "offer_declined"],
  offer_accepted: ["accepted_noshow", "accepted_declined"],
};

export type Gender = "male" | "female" | "other";

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: Gender | null;
  current_company: string | null;
  current_salary: number | null;
  desired_salary: number | null;
  status: CandidateStatus;
  sub_status: CandidateStatus | null;
  source: string | null;            // 流入経路（PITキャリア / PITアプリ 等）
  experience_type: string | null;   // 未経験者 / 経験者
  education_level: string | null;   // 高卒・専門卒 / 高専・短大卒・その他
  ca_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // JOIN
  ca?: { id: string; name: string } | null;
}

export type CandidateInsert = Omit<Candidate, "id" | "is_deleted" | "created_at" | "updated_at" | "ca">;
export type CandidateUpdate = Partial<CandidateInsert> & { updated_at?: string };

export interface Advisor {
  id: string;
  name: string;
}

export interface StatusHistory {
  id: string;
  candidate_id: string;
  from_status: CandidateStatus | null;
  to_status: CandidateStatus;
  changed_by: string | null;
  changed_at: string;
  // JOIN
  changer?: { name: string } | null;
}

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  applied: "応募",
  setup: "設置",
  conducted: "実施",
  supporting: "サポート中",
  offered: "内定",
  offer_accepted: "内定承諾",
  placed: "入社",
  conducted_noshow: "実施後：トビ",
  conducted_declined: "実施後：辞退",
  support_noshow: "サポート後：トビ",
  support_declined: "サポート後：辞退",
  support_released: "サポート後：リリース",
  offer_noshow: "内定後：トビ",
  offer_declined: "内定後：辞退",
  accepted_noshow: "承諾後：トビ",
  accepted_declined: "承諾後：辞退",
};

export const STATUS_COLORS: Record<CandidateStatus, string> = {
  applied: "bg-blue-100 text-blue-700",
  setup: "bg-sky-100 text-sky-700",
  conducted: "bg-purple-100 text-purple-700",
  supporting: "bg-yellow-100 text-yellow-800",
  offered: "bg-green-100 text-green-700",
  offer_accepted: "bg-emerald-100 text-emerald-700",
  placed: "bg-teal-100 text-teal-700",
  conducted_noshow: "bg-red-100 text-red-600",
  conducted_declined: "bg-orange-100 text-orange-600",
  support_noshow: "bg-red-100 text-red-600",
  support_declined: "bg-orange-100 text-orange-600",
  support_released: "bg-gray-100 text-gray-600",
  offer_noshow: "bg-red-100 text-red-600",
  offer_declined: "bg-orange-100 text-orange-600",
  accepted_noshow: "bg-red-100 text-red-600",
  accepted_declined: "bg-orange-100 text-orange-600",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

// =============================================================
// メモ・連絡履歴
// =============================================================

export type MemoType = "interview" | "contact" | "other";

export interface CandidateMemo {
  id: string;
  candidate_id: string;
  user_id: string | null;
  content: string;
  memo_type: MemoType;
  created_at: string;
  // JOIN
  author?: { name: string } | null;
}

export const MEMO_TYPE_LABELS: Record<MemoType, string> = {
  interview: "面談メモ",
  contact: "連絡履歴",
  other: "その他",
};

export const MEMO_TYPE_COLORS: Record<MemoType, string> = {
  interview: "bg-purple-100 text-purple-700",
  contact: "bg-sky-100 text-sky-700",
  other: "bg-gray-100 text-gray-600",
};
