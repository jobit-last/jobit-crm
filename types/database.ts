// =============================================================
// Jobit CRM — Database Type Definitions
// 要件定義書「6. 主要DBテーブル設計」に基づく型定義
// =============================================================

// -------------------------------------------------------------
// Enum Types
// -------------------------------------------------------------

export type UserRole = "admin" | "manager" | "advisor";

export type Gender = "male" | "female" | "other";

export type CandidateStatus =
  | "new"            // 新規登録
  | "interviewed"    // 面談済み
  | "proposed"       // 案件紹介中
  | "in_selection"   // 選考中
  | "offered"        // 内定
  | "placed"         // 入社
  | "declined";      // 辞退

export type ContractStatus =
  | "prospect"       // 見込み
  | "active"         // 契約中
  | "paused"         // 休止
  | "terminated";    // 解約

export type EmploymentType = "full_time" | "contract" | "part_time";

export type JobStatus =
  | "open"           // 募集中
  | "in_selection"   // 選考中
  | "filled"         // 充足
  | "closed";        // 募集終了

export type ApplicationStatus =
  | "document_screening" // 書類選考
  | "first_interview"    // 一次面接
  | "second_interview"   // 二次面接
  | "final_interview"    // 最終面接
  | "offered"            // 内定
  | "placed"             // 入社
  | "declined";          // 辞退

export type ActivityType =
  | "call_outgoing"  // 電話（発信）
  | "call_incoming"  // 電話（着信）
  | "email"          // メール
  | "meeting"        // 面談
  | "note"           // メモ
  | "other";         // その他

// -------------------------------------------------------------
// Table Types
// -------------------------------------------------------------

/** 6.1 profiles（ユーザープロフィール） */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** 6.2 candidates（求職者） */
export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  first_name_kana: string | null;
  last_name_kana: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: Gender | null;
  postal_code: string | null;
  address: string | null;
  current_company: string | null;
  current_industry: string | null;
  current_job_type: string | null;
  current_salary: number | null;
  experience_years: number | null;
  desired_industry: string | null;
  desired_job_type: string | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  desired_location: string | null;
  desired_start_date: string | null;
  status: CandidateStatus;
  assigned_advisor_id: string | null;
  notes: string | null;
  resume_url: string | null;
  cv_url: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** 6.3 companies（企業） */
export interface Company {
  id: string;
  name: string;
  industry: string | null;
  address: string | null;
  employee_count: number | null;
  established_year: number | null;
  website_url: string | null;
  contact_name: string | null;
  contact_department: string | null;
  contact_position: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_status: ContractStatus;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** 6.4 jobs（求人案件） */
export interface Job {
  id: string;
  company_id: string;
  title: string;
  job_type: string | null;
  industry: string | null;
  employment_type: EmploymentType | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  description: string | null;
  required_skills: string | null;
  preferred_skills: string | null;
  required_experience_years: number | null;
  status: JobStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** 6.5 applications（選考） */
export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: ApplicationStatus;
  interview_date: string | null;
  offered_salary: number | null;
  offered_start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** 6.6 activities（対応履歴） */
export interface Activity {
  id: string;
  type: ActivityType;
  candidate_id: string | null;
  company_id: string | null;
  user_id: string;
  title: string;
  content: string | null;
  activity_date: string;
  created_at: string;
}

// -------------------------------------------------------------
// Insert / Update helper types
// -------------------------------------------------------------

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;
export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">> & { updated_at?: string };

export type CandidateInsert = Omit<Candidate, "id" | "created_at" | "updated_at" | "is_deleted"> & { id?: string };
export type CandidateUpdate = Partial<Omit<Candidate, "id" | "created_at">> & { updated_at?: string };

export type CompanyInsert = Omit<Company, "id" | "created_at" | "updated_at" | "is_deleted"> & { id?: string };
export type CompanyUpdate = Partial<Omit<Company, "id" | "created_at">> & { updated_at?: string };

export type JobInsert = Omit<Job, "id" | "created_at" | "updated_at" | "is_deleted"> & { id?: string };
export type JobUpdate = Partial<Omit<Job, "id" | "created_at">> & { updated_at?: string };

export type ApplicationInsert = Omit<Application, "id" | "created_at" | "updated_at"> & { id?: string };
export type ApplicationUpdate = Partial<Omit<Application, "id" | "created_at">> & { updated_at?: string };

export type ActivityInsert = Omit<Activity, "id" | "created_at"> & { id?: string };
