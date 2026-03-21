// =============================================================
// 自動フォロー送信 型定義
// =============================================================

export type FollowType =
  | "面談リマインド"
  | "面接リマインド"
  | "入社後フォロー"
  | "リサポ連絡";

export type FollowStatus =
  | "pending"   // 送信待ち
  | "sent"      // 送信済み
  | "failed";   // 送信失敗

export type FollowChannelType = "LINE" | "SMS" | "email";

export interface FollowLog {
  id: string;
  candidate_id: string;
  template_id: string | null;
  type: FollowType;
  content: string;
  status: FollowStatus;
  sent_at: string | null;
  created_at: string;
  // JOIN
  candidate?: { id: string; name: string; phone: string | null; email: string | null } | null;
  template?: { id: string; name: string; type: FollowChannelType } | null;
}

export type FollowLogInsert = Omit<FollowLog, "id" | "created_at" | "candidate" | "template">;

export const FOLLOW_TYPE_LABELS: Record<FollowType, string> = {
  面談リマインド: "面談リマインド",
  面接リマインド: "面接リマインド",
  入社後フォロー: "入社後フォロー",
  リサポ連絡:     "リサポ連絡",
};

export const FOLLOW_STATUS_LABELS: Record<FollowStatus, string> = {
  pending: "送信待ち",
  sent:    "送信済み",
  failed:  "送信失敗",
};

export const FOLLOW_STATUS_COLORS: Record<FollowStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  sent:    "bg-green-100 text-green-700",
  failed:  "bg-red-100 text-red-600",
};

export const FOLLOW_TYPES: FollowType[] = [
  "面談リマインド",
  "面接リマインド",
  "入社後フォロー",
  "リサポ連絡",
];
