export type KnowledgeCategory = "面接対策" | "企業情報" | "業界情報" | "業務マニュアル";

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  "面接対策",
  "企業情報",
  "業界情報",
  "業務マニュアル",
];

export const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  "面接対策":    "bg-blue-100 text-blue-700",
  "企業情報":    "bg-green-100 text-green-700",
  "業界情報":    "bg-purple-100 text-purple-700",
  "業務マニュアル": "bg-amber-100 text-amber-700",
};

export interface Knowledge {
  id: string;
  title: string;
  content: string | null;
  category: KnowledgeCategory | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
