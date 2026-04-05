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

  | "placed"                // 入社",

  | "failed"                // 不合格

  | "closed";               // 対応終了



export type Gender = "male" | "female" | "other";



export type CandidateSource = "meta_ad" | "pit" | "pit_career" | "it_school" | "referral" | "direct" | "other";

export type FormType = "pit_career_flow" | "pit_app_flow" | "manual";

export type ContactStatus = "pending" | "connected" | "absent" | "missed" | "callback" | "unreachable";

export type InterviewType = "online" | "in_person" | "phone";

export type LivingArrangement = "family" | "alone" | "dormitory" | "other";



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

  portal_login_id: string | null;

  portal_active: boolean;

  is_deleted: boolean;

  created_at: string;

  updated_at: string;

  // PIT Flow Fields

  source: CandidateSource | null;

  form_type: FormType | null;

  ad_identifier: string | null;

  utm_source: string | null;

  utm_medium: string | null;

  utm_campaign: string | null;

  line_registered: boolean;

  line_id: string | null;

  line_display_name: string | null;

  application_date: string | null;

  application_time: string | null;

  contact_status: ContactStatus;

  contact_attempts: number;

  last_contact_at: string | null;

  contact_notes: string | null;

  interview_date: string | null;

  interview_url: string | null;

  interview_type: InterviewType;

  living_arrangement: LivingArrangement | null;

  prefecture: string | null;

  nearest_station: string | null;

  education: string | null;

  graduation_year: number | null;

  desired_industry: string | null;

  desired_job_type: string | null;

  available_start_date: string | null;

  admin_notes: string | null;

  // JOIN

  ca?: { id: string; name: string } | null;

}



export type CandidateInsert = Omit<Candidate, "id" | "is_deleted" | "created_at" | "updated_at" | "ca" | "contact_attempts" | "line_registered">;

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

  interviewed: "面觯済み",

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

  male: "瓷性",

  female: "女性",

  other: "その他",

};



export const SOURCE_LABELS: Record<CandidateSource, string> = {

  meta_ad: "メタ広告",

  pit: "PIT",

  pit_career: "PITキャリア",

  it_school: "ITスクール",

  referral: "紹介",

  direct: "直接応募",

  other: "その他",

};



export const FORM_TYPE_LABELS: Record<FormType, string> = {

  pit_career_flow: "PITキャリアフロー",

  pit_app_flow: "PITアプリフロー",

  manual: "手動登録",

};



export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {

  pending: "未対応",

  connected: "通電済",

  absent: "不在",

  missed: "折返し待ち",

  callback: "コールバック予定",

  unreachable: "連絮不能",

};



export const CONTACT_STATUS_COLORS: Record<ContactStatus, string> = {

  pending: "bg-gray-100 text-gray-600",

  connected: "bg-green-100 text-green-700",

  absent: "bg-yellow-100 text-yellow-700",

  missed: "bg-orange-100 text-orange-700",

  callback: "bg-blue-100 text-blue-700",

  unreachable: "bg-red-100 text-red-600",

};



export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {

  online: "オンライン",

  in_person: "対面",

  phone: "電話",

};



export const LIVING_ARRANGEMENT_LABELS: Record<LivingArrangement, string> = {

  family: "実家",

  alone: "独り暫らし",

  dormitory: "寬",

  other: "その他",

};



export const PREFECTURE_OPTIONS = [

  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",

  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",

  "新潟県", "富山県", "石川県", "福井県", "山梆縌", "長野県", "吐阜県",

  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",

  "奈良県", "和歠山県", "鳥取県", "島根県", "岡山�0�", "広岶県", "山口県",

  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",

  "熉本県", "大分県", "宮崎県", "鱿児島県", "沖縄県",

];



// =============================================================

// メモ・連絠履歴

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

  interview: "面谇メモ",

  contact: "連絮履歭",

  other: "その他",

};



export const MEMO_TYPE_COLORS: Record<MemoType, string> = {

  interview: "bg-purple-100 text-purple-700",

  contact: "bg-sky-100 text-sky-700",

  other: "bg-gray-100 text-gray-600",

};

// =============================================================
// Portal sub-statuses (dropout/failure)
// =============================================================

export const SUB_STATUSES = [
  "conducted_noshow",
  "conducted_declined",
  "support_noshow",
  "support_declined",
  "support_released",
  "offer_noshow",
  "offer_declined",
  "accepted_noshow",
  "accepted_declined",
] as const;
