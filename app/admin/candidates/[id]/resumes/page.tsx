import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Resume } from "@/types/resume";
import ResumesClient from "./_components/ResumesClient";

export default async function ResumesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: candidate, error }, { data: resumes }] = await Promise.all([
    supabase.from("candidates").select("id, name").eq("id", id).single(),
    supabase
      .from("resumes")
      .select("*")
      .eq("candidate_id", id)
      .order("version", { ascending: false }),
  ]);

  if (error || !candidate) notFound();

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/candidates" className="hover:underline" style={{ color: "#002D37" }}>
          求職者管理
        </Link>
        <span>/</span>
        <Link
          href={`/admin/candidates/${id}`}
          className="hover:underline"
          style={{ color: "#002D37" }}
        >
          {candidate.name}
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>履歴書管理</span>
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#002D37" }}>
          履歴書管理 — {candidate.name}
        </h1>
        <Link
          href={`/admin/candidates/${id}/resumes/new`}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752]"
          style={{ backgroundColor: "#00E05D", color: "#002D37" }}
        >
          新規作成
        </Link>
      </div>

      <ResumesClient
        candidateId={id}
        resumes={(resumes as Resume[]) ?? []}
      />
    </div>
  );
}
