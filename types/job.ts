export interface Job {
  id: string;
  company_id: string | null;
  company_name?: string | null;
  title: string;
  description: string | null;
  job_type: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobSearchParams {
  keyword?: string;
  job_type?: string;
  location?: string;
  salary_min?: string;
  salary_max?: string;
  is_published?: string;
  page?: string;
  per_page?: string;
  sort_by?: string;
  sort_order?: string;
}
