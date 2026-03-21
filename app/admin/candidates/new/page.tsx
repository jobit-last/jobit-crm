import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Advisor } from "@/types/candidate";
import CandidateForm from "../_components/CandidateForm";

export default async function NewCandidatePage() {
  const supabase = await createClient();

  const { data: advisors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "advisor")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/candidates" className="hover:underline" style={{ color: "#002D37" }}>
          求職者管理
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>新規登録</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#002D37" }}>
        求職者 新規登録
      </h1>

      <CandidateForm mode="create" advisors={(advisors as Advisor[]) ?? []} />
    </div>
  );
}
