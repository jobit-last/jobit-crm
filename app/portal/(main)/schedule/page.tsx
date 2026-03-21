import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ScheduleClient from "./_components/ScheduleClient";
import type { Schedule } from "@/types/schedule";
import type { Interview } from "@/types/interview";

export default async function PortalSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .eq("is_deleted", false)
    .single();

  if (!candidate) {
    return (
      <div className="text-center py-16 text-gray-500">
        求職者情報が見つかりません。
      </div>
    );
  }

  // スケジュール取得（面談）
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("candidate_id", candidate.id)
    .gte("scheduled_at", new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
    .order("scheduled_at", { ascending: true });

  // 面接取得（選考経由）
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, application:applications!inner(candidate_id, job:jobs(id, title, company:companies(id, name)))")
    .eq("application.candidate_id", candidate.id)
    .gte("scheduled_at", new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
    .order("scheduled_at", { ascending: true });

  return (
    <div style={{ backgroundColor: "#F2F6FF", minHeight: "100%" }} className="pb-8">
      {/* Hero Header */}
      <div
        className="rounded-2xl px-8 py-8 mb-8 shadow-lg"
        style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
      >
        <h1 className="text-2xl font-bold text-white">スケジュール</h1>
        <p className="text-white/70 text-sm mt-1">面接・面談の予定を管理</p>
      </div>

      <ScheduleClient
        schedules={(schedules as Schedule[]) ?? []}
        interviews={(interviews as (Interview & { application: any })[]) ?? []}
      />
    </div>
  );
}
