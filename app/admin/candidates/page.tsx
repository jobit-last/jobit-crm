import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Candidate, Advisor } from "@/types/candidate";
import CandidatesClient from "./_components/CandidatesClient";

type SearchParams = {
  name?: string;
  status?: string;
  ca_id?: string;
  page?: string;
};

export default async function CandidatesPage({
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
    .from("candidates")
    .select("*, ca:profiles!candidates_ca_id_fkey(id, full_name)", { count: "exact" })
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (sp.name) query = query.ilike("name", `%${sp.name}%`);
  if (sp.status) query = query.eq("status", sp.status);
  if (sp.ca_id) query = query.eq("ca_id", sp.ca_id);

  const [{ data: candidates, count }, { data: advisors }] = await Promise.all([
    query,
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "advisor")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#1A1A2E" }}>
          求職者管理
        </h1>
        <Link
          href="/admin/candidates/new"
          className="px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#002D37" }}
        >
          + 新規登録
        </Link>
      </div>

      <CandidatesClient
        candidates={(candidates as Candidate[]) ?? []}
        totalCount={count ?? 0}
        currentPage={page}
        limit={limit}
        advisors={(advisors as Advisor[]) ?? []}
        initialFilters={{
          name: sp.name ?? "",
          status: sp.status ?? "",
          ca_id: sp.ca_id ?? "",
        }}
      />
    </div>
  );
}
