import Link from "next/link";
import JobsClient from "./JobsClient";
import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/types/job";

const ALLOWED_SORT_COLUMNS = ["title", "job_type", "location", "salary_min", "salary_max", "is_published", "created_at"];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const keyword = params.keyword || "";
  const job_type = params.job_type || "";
  const location = params.location || "";
  const salary_min = params.salary_min || "";
  const salary_max = params.salary_max || "";
  const is_published = params.is_published ?? "";
  const page = parseInt(params.page || "1", 10);
  const per_page = parseInt(params.per_page || "20", 10);
  const sort_by = params.sort_by || "created_at";
  const sort_order = params.sort_order === "asc";

  const safeSortBy = ALLOWED_SORT_COLUMNS.includes(sort_by) ? sort_by : "created_at";

  let query = supabase
    .from("jobs")
    .select("*, companies(name)", { count: "exact" });

  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,required_skills.ilike.%${keyword}%`);
  }
  if (job_type) query = query.ilike("job_type", `%${job_type}%`);
  if (location) query = query.ilike("location", `%${location}%`);
  if (salary_min) query = query.gte("salary_min", parseInt(salary_min));
  if (salary_max) query = query.lte("salary_max", parseInt(salary_max));
  if (is_published !== "") query = query.eq("is_published", is_published === "true");

  query = query.order(safeSortBy, { ascending: sort_order });

  const from = (page - 1) * per_page;
  query = query.range(from, from + per_page - 1);

  const { data, count, error } = await query;

  if (error) console.error("Supabase error:", error.message);

  const jobs: Job[] = (data || []).map((row: Record<string, unknown>) => ({
    ...(row as Job),
    company_name: (row.companies as { name: string } | null)?.name ?? null,
    companies: undefined,
  }));

  const total = count || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary">求人一覧</h1>
            <Link href="/admin/candidates" className="text-sm text-gray-500 hover:text-primary transition-colors">
              求職者一覧
            </Link>
            <Link href="/admin/companies" className="text-sm text-gray-500 hover:text-primary transition-colors">
              企業一覧
            </Link>
          </div>
          <Link
            href="/admin/jobs/new"
            className="bg-cta hover:bg-cta-hover text-white px-5 py-2 rounded text-sm font-medium transition-colors"
          >
            + 新規登録
          </Link>
        </div>

        <JobsClient
          initialJobs={jobs}
          total={total}
          page={page}
          perPage={per_page}
        />
      </div>
    </div>
  );
}
