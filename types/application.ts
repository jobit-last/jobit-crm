// =============================================================
// 選考管理 型定義
// =============================================================

export type ApplicationStatus =
  | "document_screening"  // 書類選考中
  | "first_interview"     // 一次面接
  | "second_interview"    // 二次面接
  | "final_interview"     // 最終面接
  | "offered"             // 内定
  | "placed"              // 入社
  | "failed"              // 不合格
  | "declined";           // 辞退

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: ApplicationStatus;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  // JOIN
  candidate?: { id: string; name: string } | null;
  job?: {
    id: string;
    title: string;
    company: { id: string; name: string } | null;
  } | null;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_by: string | null;
  changed_at: string;
  // JOIN
  changer?: { full_name: string } | null;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  document_screening: "書類選考中",
  first_interview: "一次面接",
  second_interview: "二次面接",
  final_interview: "最終面接",
  offered: "内定",
  placed: "入社",
  failed: "不合格",
  declined: "辞退",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  document_screening: "bg-blue-100 text-blue-700",
  first_interview: "bg-sky-100 text-sky-700",
  second_interview: "bg-indigo-100 text-indigo-700",
  final_interview: "bg-purple-100 text-purple-700",
  offered: "bg-green-100 text-green-700",
  placed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
  declined: "bg-gray-100 text-gray-600",
};
