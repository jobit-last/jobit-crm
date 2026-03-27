// =============================================================
// Jobit CRM — 共通型定義エントリーポイント
// 使い方: import { Candidate, Company, ... } from "@/types";
// =============================================================

export {
  // Enum Types
  type UserRole,
  type Gender,
  type CandidateStatus,
  type ContractStatus,
  type EmploymentType,
  type JobStatus,
  type ApplicationStatus,
  type ActivityType,

  // Table Types
  type Profile,
  type Candidate,
  type Company,
  type Job,
  type Application,
  type Activity,

  // Insert / Update helper types
  type ProfileInsert,
  type ProfileUpdate,
  type CandidateInsert,
  type CandidateUpdate,
  type CompanyInsert,
  type CompanyUpdate,
  type JobInsert,
  type JobUpdate,
  type ApplicationInsert,
  type ApplicationUpdate,
  type ActivityInsert,
} from "./database";
