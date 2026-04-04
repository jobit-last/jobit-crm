export type Temperature = "HOT" | "WARM" | "COLD";

export const TEMPERATURE_LABELS: Record<Temperature, string> = {
  HOT: "HOT（積極採用中）",
  WARM: "WARM（採用意欲あり）",
  COLD: "COLD（採用停止中）",
};

export const TEMPERATURE_COLORS: Record<Temperature, string> = {
  HOT: "bg-red-100 text-red-800",
  WARM: "bg-yellow-100 text-yellow-800",
  COLD: "bg-blue-100 text-blue-800",
};

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  temperature: Temperature | null;
  ra_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // JOIN
  ra?: { id: string; name: string } | null;
}

export interface CompanySearchParams {
  name?: string;
  industry?: string;
  temperature?: string;
  page?: string;
  per_page?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CompaniesResponse {
  companies: Company[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}
