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
    .select("*, ca:profiles!candidates_ca_id_fkey(id, full_name)")
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
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#21242B" }}>
        プロフィール
      </h1>

      <ProfileClient candidate={candidate as Candidate} />
    </div>
  );
}
