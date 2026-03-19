export type NotificationType = "LINE" | "SMS" | "email";
export type NotificationStatus = "sent" | "failed" | "pending";

export interface Notification {
  id: string;
  candidate_id: string | null;
  type: NotificationType;
  content: string;
  status: NotificationStatus;
  sent_at: string | null;
  created_at: string;
  candidate?: { id: string; name: string } | null;
}

export type NotificationInsert = Omit<Notification, "id" | "created_at" | "candidate">;

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  LINE: "LINE",
  SMS: "SMS",
  email: "メール",
};

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  LINE: "bg-green-100 text-green-700",
  SMS: "bg-blue-100 text-blue-700",
  email: "bg-orange-100 text-orange-700",
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  sent: "送信済み",
  failed: "失敗",
  pending: "保留中",
};

export const NOTIFICATION_STATUS_COLORS: Record<NotificationStatus, string> = {
  sent: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
};

export const TEMPLATES: { label: string; content: string }[] = [
  {
    label: "面談日程確認",
    content:
      "いつもお世話になっております。面談日程についてご確認させていただきたく、ご連絡いたしました。\nご都合のよろしい日時をお知らせいただけますでしょうか。\nよろしくお願いいたします。",
  },
  {
    label: "書類提出依頼",
    content:
      "お世話になっております。選考を進めるにあたり、以下の書類をご提出いただけますでしょうか。\n\n・履歴書\n・職務経歴書\n\nご不明な点はお気軽にご連絡ください。よろしくお願いいたします。",
  },
  {
    label: "面接日程確認",
    content:
      "お世話になっております。面接の日程についてご確認させてください。\nご都合はいかがでしょうか。改めてご連絡いただけますと幸いです。\nよろしくお願いいたします。",
  },
  {
    label: "面接リマインダー",
    content:
      "明日の面接についてのリマインダーをお送りします。\nお時間・場所についてご確認のほどよろしくお願いいたします。\nご不明な点があれば、お気軽にご連絡ください。",
  },
  {
    label: "選考通過のご連絡",
    content:
      "この度は弊社の選考にご参加いただき、誠にありがとうございました。\n選考の結果、次のステップに進んでいただけることとなりました。\n改めて詳細をご連絡いたします。引き続きよろしくお願いいたします。",
  },
  {
    label: "内定通知",
    content:
      "この度は選考にご参加いただき、誠にありがとうございました。\n慎重に検討いたしました結果、ぜひ一緒に働いていただきたいと考えております。\n正式な内定のご連絡をさせていただきます。詳細については改めてご連絡いたします。",
  },
  {
    label: "選考終了のご連絡",
    content:
      "この度は弊社の選考にご参加いただき、誠にありがとうございました。\n選考の結果、誠に残念ながら今回はご縁がなかったという結論に至りました。\nまたの機会にどうぞよろしくお願いいたします。",
  },
];
