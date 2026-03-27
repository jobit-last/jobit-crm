// =============================================================
// 求職者管理 型定義
// =============================================================

export type CandidateStatus =
  | "new"                   // 新規登録
  | "interview_scheduling"  // 面談調整中
  | "interviewed"           // 面談済み
  | "job_proposed"          // 求人提案中
  | "applying"              // 応募中
  | "in_selection"          // 選考中
  | "offered"               // 内定
  | "placed"                // 入社
  | "failed"                // 不合格
  | "closed";               // 対応終了

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
  new: "新規登録",
  interview_scheduling: "面談調整中",
  interviewed: "面談済み",
  job_proposed: "求人提案中",
  applying: "応募中",
  in_selection: "選考中",
  offered: "内定",
  placed: "入社",
  failed: "不合格",
  closed: "対応終了",
};

export const STATUS_COLORS: Record<CandidateStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  interview_scheduling: "bg-sky-100 text-sky-700",
  interviewed: "bg-purple-100 text-purple-700",
  job_proposed: "bg-yellow-100 text-yellow-800",
  applying: "bg-orange-100 text-orange-700",
  in_selection: "bg-amber-100 text-amber-700",
  offered: "bg-green-100 text-green-700",
  placed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
  closed: "bg-gray-100 text-gray-600",
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
