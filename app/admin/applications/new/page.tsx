import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ApplicationForm from "../_components/ApplicationForm";

export default async function NewApplicationPage() {
  const supabase = await createClient();

  const [{ data: candidates }, { data: jobs }] = await Promise.all([
    supabase
      .from("candidates")
      .select("id, name")
      .eq("is_deleted", false)
      .order("name"),
    supabase
      .from("jobs")
      .select("id, title, company:companies(id, name)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/applications" className="hover:underline" style={{ color: "#002D37" }}>
          選考管理
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>新規登録</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#002D37" }}>
        選考 新規登録
      </h1>

      <ApplicationForm
        candidates={candidates ?? []}
        jobs={(jobs ?? []).map((j: any) => ({
          id: j.id,
          title: j.title,
          company: Array.isArray(j.company) ? j.company[0] ?? null : j.company,
        }))}
      />
    </div>
  );
}
