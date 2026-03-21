import { Suspense } from "react";
import Link from "next/link";
import CompaniesSearch from "./CompaniesSearch";
import CompaniesTable from "./CompaniesTable";
import CompaniesPagination from "./CompaniesPagination";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_SORT_COLUMNS = ["name", "industry", "company_size", "temperature", "created_at"];

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const name = params.name || "";
  const industry = params.industry || "";
  const temperature = params.temperature || "";
  const page = parseInt(params.page || "1", 10);
  const per_page = parseInt(params.per_page || "20", 10);
  const sort_by = params.sort_by || "created_at";
  const sort_order = params.sort_order === "asc";

  const safeSortBy = ALLOWED_SORT_COLUMNS.includes(sort_by) ? sort_by : "created_at";

  let query = supabase.from("companies").select("*", { count: "exact" });

  if (name) query = query.ilike("name", `%${name}%`);
  if (industry) query = query.ilike("industry", `%${industry}%`);
  if (temperature) query = query.eq("temperature", temperature);

  query = query.order(safeSortBy, { ascending: sort_order });

  const from = (page - 1) * per_page;
  query = query.range(from, from + per_page - 1);

  const { data, count, error } = await query;

  const total = count || 0;
  const companies = data || [];

  if (error) {
    console.error("Supabase error:", error.message);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary">企業一覧</h1>
            <Link
              href="/admin/candidates"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              求職者一覧
            </Link>
          </div>
          <Link
            href="/admin/companies/new"
            className="bg-cta hover:bg-cta-hover text-primary font-semibold px-5 py-2 rounded text-sm transition-colors"
          >
            + 新規登録
          </Link>
        </div>

        <Suspense fallback={<div className="text-gray-500">読み込み中...</div>}>
          <CompaniesSearch />
        </Suspense>

        <CompaniesTable companies={companies} />

        <CompaniesPagination
          total={total}
          page={page}
          perPage={per_page}
          totalPages={Math.ceil(total / per_page)}
        />
      </div>
    </div>
  );
}
