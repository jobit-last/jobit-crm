export type ContractStatus = "draft" | "active" | "expired";

export interface Contract {
  id: string;
  company_id: string;
  title: string;
  content: string | null;
  status: ContractStatus;
  start_date: string | null;
  end_date: string | null;
  file_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  company_name?: string;
}

export interface Memorandum {
  id: string;
  company_id: string;
  contract_id: string | null;
  title: string;
  content: string | null;
  status: ContractStatus;
  signed_date: string | null;
  file_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  company_name?: string;
  contract_title?: string;
}
