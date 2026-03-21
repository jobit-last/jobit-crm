import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Application } from "@/types/application";
import ApplicationsClient from "./_components/ApplicationsClient";

type SearchParams = {
  status?: string;
  candidate_id?: string;
  page?: string;
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("applications")
    .select(
      `*,
      candidate:candidates(id, name),
      job:jobs(id, title, company:companies(id, name))`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (sp.status) query = query.eq("status", sp.status);
  if (sp.candidate_id) query = query.eq("candidate_id", sp.candidate_id);

  const { data: applications, count } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#002D37" }}>
          選考管理
        </h1>
        <Link
          href="/admin/applications/new"
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752]"
          style={{ backgroundColor: "#00E05D", color: "#002D37" }}
        >
          新規登録
        </Link>
      </div>

      <ApplicationsClient
        applications={(applications as Application[]) ?? []}
        totalCount={count ?? 0}
        currentPage={page}
        limit={limit}
        initialFilters={{
          status: sp.status ?? "",
          candidate_id: sp.candidate_id ?? "",
        }}
      />
    </div>
  );
}
