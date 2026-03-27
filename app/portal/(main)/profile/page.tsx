import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Candidate } from "@/types/candidate";
import ProfileClient from "./_components/ProfileClient";

export default async function PortalProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*, ca:users!candidates_ca_id_fkey(id, name)")
    .eq("email", user.email)
    .eq("is_deleted", false)
    .single();

  if (error || !candidate) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">求職者情報が見つかりません。</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F2F6FF", minHeight: "100%" }} className="pb-8">
      {/* Hero Header */}
      <div
        className="rounded-2xl px-4 sm:px-8 py-6 sm:py-8 mb-8 shadow-lg"
        style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
      >
        <h1 className="text-2xl font-bold text-white">プロフィール</h1>
        <p className="text-white/70 text-sm mt-1">あなたの基本情報と希望条件</p>
      </div>

      <ProfileClient candidate={candidate as Candidate} />
    </div>
  );
}
