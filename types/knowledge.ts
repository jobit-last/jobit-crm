export type KnowledgeCategory = "面接対策" | "企業情報" | "業界情報" | "業務マニュアル" | "選考結果";

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  "面接対策",
  "企業情報",
  "業界情報",
  "業務マニュアル",
  "選考結果",
];

export const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  "面接対策":    "bg-blue-100 text-blue-700",
  "企業情報":    "bg-green-100 text-green-700",
  "業界情報":    "bg-purple-100 text-purple-700",
  "業務マニュアル": "bg-amber-100 text-amber-700",
  "選考結果":    "bg-rose-100 text-rose-700",
};

export type SelectionResult = "offered" | "rejected" | "declined" | "withdrawn";

export const SELECTION_RESULT_LABELS: Record<SelectionResult, string> = {
  offered: "内定",
  rejected: "不合格",
  declined: "辞退",
  withdrawn: "途中辞退",
};

export const SELECTION_RESULT_COLORS: Record<SelectionResult, string> = {
  offered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  declined: "bg-yellow-100 text-yellow-700",
  withdrawn: "bg-gray-100 text-gray-700",
};

export interface Knowledge {
  id: string;
  title: string;
  content: string | null;
  category: KnowledgeCategory | null;
  tags: string[];
  candidate_id: string | null;
  company_id: string | null;
  selection_result: SelectionResult | null;
  result_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // JOIN
  candidate?: { id: string; name: string } | null;
  company?: { id: string; name: string } | null;
}
