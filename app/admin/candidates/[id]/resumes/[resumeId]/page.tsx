import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Resume } from "@/types/resume";
import ResumeEditClient from "./_components/ResumeEditClient";

export default async function ResumeEditPage({
  params,
}: {
  params: Promise<{ id: string; resumeId: string }>;
}) {
  const { id, resumeId } = await params;
  const supabase = await createClient();

  const [{ data: candidate, error: cErr }, { data: resume, error: rErr }] =
    await Promise.all([
      supabase.from("candidates").select("id, name").eq("id", id).single(),
      supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .eq("candidate_id", id)
        .single(),
    ]);

  if (cErr || !candidate || rErr || !resume) notFound();

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
        <Link
          href={`/admin/candidates/${id}/resumes`}
          className="hover:underline"
          style={{ color: "#002D37" }}
        >
          履歴書管理
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>編集</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#002D37" }}>
        履歴書編集 — {candidate.name}
      </h1>

      <ResumeEditClient
        candidateId={id}
        resume={resume as Resume}
      />
    </div>
  );
}
