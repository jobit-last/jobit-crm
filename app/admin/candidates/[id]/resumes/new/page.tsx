import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResumeEditor from "./_components/ResumeEditor";

export default async function NewResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("id, name")
    .eq("id", id)
    .single();

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
        <Link
          href={`/admin/candidates/${id}/resumes`}
          className="hover:underline"
          style={{ color: "#002D37" }}
        >
          履歴書管理
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>新規作成</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#002D37" }}>
        履歴書 新規作成 — {candidate.name}
      </h1>

      <ResumeEditor candidateId={id} candidateName={candidate.name} />
    </div>
  );
}
