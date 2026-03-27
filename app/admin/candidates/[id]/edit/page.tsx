import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Candidate, Advisor } from "@/types/candidate";
import CandidateForm from "../../_components/CandidateForm";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: candidate, error }, { data: advisors }] = await Promise.all([
    supabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .eq("is_deleted", false)
      .single(),
    supabase
      .from("users")
      .select("id, name")
      .eq("role", "ca")
      .eq("status", "active")
      .order("name"),
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
        <span style={{ color: "#002D37" }}>編集</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#002D37" }}>
        求職者 編集
      </h1>

      <CandidateForm
        mode="edit"
        advisors={(advisors as Advisor[]) ?? []}
        initialData={candidate as Candidate}
      />
    </div>
  );
}
