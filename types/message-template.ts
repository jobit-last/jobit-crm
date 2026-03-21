// =============================================================
// メッセージテンプレート管理 型定義
// =============================================================

export type TemplateType = "LINE" | "SMS" | "email";

export interface MessageTemplate {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  variables: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageTemplateInsert = Omit<MessageTemplate, "id" | "created_at" | "updated_at">;
export type MessageTemplateUpdate = Partial<Omit<MessageTemplateInsert, "created_by">> & { updated_at?: string };

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  LINE: "LINE",
  SMS: "SMS",
  email: "メール",
};
