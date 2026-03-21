// =============================================================
// 面接日程管理 型定義
// =============================================================

export type InterviewType = "phone" | "online" | "onsite" | "first" | "second" | "final" | "executive";

export type InterviewResult = "pass" | "fail" | "pending";

export interface Interview {
  id: string;
  application_id: string;
  interview_type: InterviewType;
  scheduled_at: string;
  location: string | null;
  interviewer: string | null;
  result: InterviewResult | null;
  feedback: string | null;
  created_at: string;
}

export type InterviewInsert = Omit<Interview, "id" | "created_at">;
export type InterviewUpdate = Partial<Omit<Interview, "id" | "application_id" | "created_at">>;

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  phone:     "電話面接",
  online:    "オンライン面接",
  onsite:    "対面面接",
  first:     "一次面接",
  second:    "二次面接",
  final:     "最終面接",
  executive: "役員面接",
};

export const INTERVIEW_TYPE_COLORS: Record<InterviewType, string> = {
  phone:     "bg-sky-100 text-sky-700",
  online:    "bg-indigo-100 text-indigo-700",
  onsite:    "bg-purple-100 text-purple-700",
  first:     "bg-blue-100 text-blue-700",
  second:    "bg-violet-100 text-violet-700",
  final:     "bg-orange-100 text-orange-700",
  executive: "bg-red-100 text-red-700",
};

export const INTERVIEW_ROUND_TYPES: InterviewType[] = ["first", "second", "final", "executive"];

export const INTERVIEW_RESULT_LABELS: Record<InterviewResult, string> = {
  pass: "合格",
  fail: "不合格",
  pending: "保留",
};

export const INTERVIEW_RESULT_COLORS: Record<InterviewResult, string> = {
  pass: "bg-green-100 text-green-700",
  fail: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
};
