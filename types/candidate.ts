// =============================================================
// 求職者管理 型定義
// =============================================================

export type CandidateStatus =
  | "new"           // 新規登録
  | "interviewed"   // 面談済み
  | "proposed"      // 案件紹介中
  | "in_selection"  // 選考中
  | "offered"       // 内定
  | "placed"        // 入社
  | "declined";     // 辞退

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
  ca?: { id: string; full_name: string } | null;
}

export type CandidateInsert = Omit<Candidate, "id" | "is_deleted" | "created_at" | "updated_at" | "ca">;
export type CandidateUpdate = Partial<CandidateInsert> & { updated_at?: string };

export interface Advisor {
  id: string;
  full_name: string;
}

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  new: "新規登録",
  interviewed: "面談済み",
  proposed: "案件紹介中",
  in_selection: "選考中",
  offered: "内定",
  placed: "入社",
  declined: "辞退",
};

export const STATUS_COLORS: Record<CandidateStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  interviewed: "bg-purple-100 text-purple-700",
  proposed: "bg-yellow-100 text-yellow-800",
  in_selection: "bg-orange-100 text-orange-700",
  offered: "bg-green-100 text-green-700",
  placed: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-600",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};
