import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MyDashboardClient from "./MyDashboardClient";

const PIPELINE_STAGES = [
  { key: "new", label: "新規登録", color: "#3B82F6" },
  { key: "interview_scheduling", label: "面談調整中", color: "#0EA5E9" },
  { key: "interviewed", label: "面談済み", color: "#8B5CF6" },
  { key: "job_proposed", label: "求人提案中", color: "#EAB308" },
  { key: "applying", label: "応募中", color: "#F97316" },
  { key: "in_selection", label: "選考中", color: "#F59E0B" },
  { key: "offered", label: "内定", color: "#10B981" },
  { key: "placed", label: "入社", color: "#059669" },
] as const;

export default async function MyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ログインユーザーのusers情報取得
  const { data: me } = await supabase
    .from("users")
    .select("id, name, role")
    .eq("id", user.id)
    .single();

  if (!me) redirect("/admin/dashboard");

  // 自分が担当する求職者
  const { data: myCandidates } = await supabase
    .from("candidates")
    .select("id, name, email, phone, status, current_company, current_salary, desired_salary, updated_at, created_at")
    .eq("ca_id", me.id)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  const candidates = myCandidates || [];

  // 自分のKPI（今月）
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const thisMonthCandidates = candidates.filter(
    (c) => c.created_at >= monthStart && c.created_at <= monthEnd
  );

  const myKpi = {
    total: candidates.length,
    thisMonth: thisMonthCandidates.length,
    active: candidates.filter((c) => !["placed", "failed", "closed"].includes(c.status)).length,
    placed: candidates.filter((c) => c.status === "placed").length,
    offered: candidates.filter((c) => c.status === "offered").length,
  };

  // 期限アラート: 3日以上更新なし
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const alertCount = candidates.filter(
    (c) => !["placed", "failed", "closed"].includes(c.status) && c.updated_at < threeDaysAgo
  ).length;

  return (
    <MyDashboardClient
      caName={me.name}
      candidates={candidates}
      stages={PIPELINE_STAGES.map((s) => ({ ...s }))}
      myKpi={myKpi}
      alertCount={alertCount}
    />
  );
}
