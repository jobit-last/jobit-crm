// =============================================================
// 履歴書管理 型定義
// =============================================================

export interface ResumeContent {
  summary: string;         // 自己PR
  work_history: string;    // 職務経歴
  skills: string;          // スキル・技術
  education: string;       // 学歴
  certifications: string;  // 資格
}

export interface Resume {
  id: string;
  candidate_id: string;
  version: number;
  title: string;
  content: ResumeContent;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export type ResumeInsert = Omit<Resume, "id" | "created_at" | "updated_at">;
export type ResumeUpdate = Partial<Omit<Resume, "id" | "candidate_id" | "created_at">>;

export const EMPTY_RESUME_CONTENT: ResumeContent = {
  summary: "",
  work_history: "",
  skills: "",
  education: "",
  certifications: "",
};
