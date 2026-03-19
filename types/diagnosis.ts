export interface DiagnosisHearing {
  id: string;
  name: string;
  age: number | null;
  education: string | null;
  company: string | null;
  industry: string | null;
  occupation: string | null;
  current_salary: number | null;
  tenure_years: number | null;
  certifications: string[] | null;
  strengths: string | null;
  tools: string | null;
  work_history: string | null;
  achievements: string | null;
  has_management: boolean | null;
  management_detail: string | null;
  desired_occupation: string | null;
  desired_salary: number | null;
  desired_location: string | null;
  desired_timing: string | null;
  ca_notes: string | null;
  ca_impression: string | null;
  created_at: string;
}

export interface DiagnosisFormData {
  // Step 1 - 基本情報
  name: string;
  age: string;
  education: string;
  company: string;
  industry: string;
  occupation: string;
  current_salary: string;
  tenure_years: string;
  // Step 2 - スキル
  certifications: string[];
  strengths: string;
  tools: string;
  // Step 3 - 職務経験
  work_history: string;
  achievements: string;
  has_management: boolean | null;
  management_detail: string;
  // Step 4 - 希望条件・CAメモ
  desired_occupation: string;
  desired_salary: string;
  desired_location: string;
  desired_timing: string;
  ca_notes: string;
  ca_impression: string;
}

export const INITIAL_FORM: DiagnosisFormData = {
  name: "",
  age: "",
  education: "",
  company: "",
  industry: "",
  occupation: "",
  current_salary: "",
  tenure_years: "",
  certifications: [""],
  strengths: "",
  tools: "",
  work_history: "",
  achievements: "",
  has_management: null,
  management_detail: "",
  desired_occupation: "",
  desired_salary: "",
  desired_location: "",
  desired_timing: "",
  ca_notes: "",
  ca_impression: "",
};

export const EDUCATION_OPTIONS = [
  "中学校卒",
  "高校卒",
  "専門学校卒",
  "短期大学卒",
  "大学卒（学士）",
  "大学院卒（修士）",
  "大学院卒（博士）",
];

export const INDUSTRY_OPTIONS = [
  "IT・通信",
  "金融・保険",
  "製造業",
  "小売・流通",
  "医療・介護・福祉",
  "教育・学習支援",
  "不動産・建設",
  "コンサルティング",
  "広告・メディア・エンターテインメント",
  "人材・サービス",
  "官公庁・公共機関",
  "その他",
];

export const DESIRED_TIMING_OPTIONS = [
  "即時（今すぐ）",
  "1ヶ月以内",
  "3ヶ月以内",
  "半年以内",
  "1年以内",
  "時期未定",
];

export const STEP_LABELS = ["基本情報", "スキル", "職務経験", "希望条件・CAメモ"];
