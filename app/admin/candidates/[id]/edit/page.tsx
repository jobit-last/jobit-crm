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
      .from("profiles")
      .select("id, full_name")
      .eq("role", "advisor")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  if (error || !candidate) notFound();

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/candidates" className="hover:underline" style={{ color: "#00A0B0" }}>
          求職者管理
        </Link>
        <span>/</span>
        <Link
          href={`/admin/candidates/${id}`}
          className="hover:underline"
          style={{ color: "#00A0B0" }}
        >
          {candidate.name}
        </Link>
        <span>/</span>
        <span style={{ color: "#1A1A2E" }}>編集</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#1A1A2E" }}>
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
