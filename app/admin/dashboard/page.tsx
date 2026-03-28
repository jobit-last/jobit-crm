import { createClient } from "@/lib/supabase/server";
import KpiCard from "./KpiCard";
import DashboardCharts from "./DashboardCharts";
import ActionItems from "./ActionItems";

const KPI_CARDS = [
  { key: "new_candidates", label: "今月の新規求職者", icon: "👤", color: "#3B82F6", target: 10 },
  { key: "interviewed", label: "今月の面談数", icon: "💬", color: "#8B5CF6", target: 8 },
  { key: "in_selection", label: "今月の面接数", icon: "📋", color: "#F59E0B", target: 5 },
  { key: "offered", label: "今月の内定数", icon: "🎉", color: "#10B981", target: 3 },
  { key: "placed", label: "今月の入社数", icon: "🏢", color: "#002D37", target: 2 },
] as const;

type KpiKey = (typeof KPI_CARDS)[number]["key"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

  const { data: thisMonthAll } = await supabase
    .from("candidates")
    .select("status, created_at")
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd)
    .eq("is_deleted", false);

  const { data: activeAll } = await supabase
    .from("candidates")
    .select("status, updated_at")
    .eq("is_deleted", false);

  const thisMonthNew = (thisMonthAll ?? []).length;
  const active = activeAll ?? [];

  const kpiThis: Record<KpiKey, number> = {
    new_candidates: thisMonthNew,
    interviewed:
      active.filter((c) => c.status === "interviewed" && c.updated_at >= monthStart && c.updated_at <= monthEnd).length ||
      (thisMonthAll ?? []).filter((c) => c.status === "interviewed").length,
    in_selection:
      active.filter((c) => c.status === "in_selection" && c.updated_at >= monthStart && c.updated_at <= monthEnd).length ||
      (thisMonthAll ?? []).filter((c) => c.status === "in_selection").length,
    offered:
      active.filter((c) => c.status === "offered" && c.updated_at >= monthStart && c.updated_at <= monthEnd).length ||
      (thisMonthAll ?? []).filter((c) => c.status === "offered").length,
    placed:
      active.filter((c) => c.status === "placed" && c.updated_at >= monthStart && c.updated_at <= monthEnd).length ||
      (thisMonthAll ?? []).filter((c) => c.status === "placed").length,
  };

  const { data: prevMonthAll } = await supabase
    .from("candidates")
    .select("status, created_at, updated_at")
    .gte("created_at", prevMonthStart)
    .lte("created_at", prevMonthEnd)
    .eq("is_deleted", false);

  const prevMonth = prevMonthAll ?? [];
  const kpiPrev: Record<KpiKey, number> = {
    new_candidates: prevMonth.length,
    interviewed: prevMonth.filter((c) => c.status === "interviewed").length,
    in_selection: prevMonth.filter((c) => c.status === "in_selection").length,
    offered: prevMonth.filter((c) => c.status === "offered").length,
    placed: prevMonth.filter((c) => c.status === "placed").length,
  };

  const { data: monthlyRaw } = await supabase
    .from("candidates")
    .select("created_at")
    .gte("created_at", twelveMonthsAgo)
    .eq("is_deleted", false);

  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = d.getFullYear() + "/" + String(d.getMonth() + 1).padStart(2, "0");
    monthlyMap[k] = 0;
  }
  (monthlyRaw ?? []).forEach((c) => {
    const d = new Date(c.created_at);
    const k = d.getFullYear() + "/" + String(d.getMonth() + 1).padStart(2, "0");
    if (k in monthlyMap) monthlyMap[k]++;
  });
  const monthlyRegistrations = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

  const STATUS_LABELS: Record<string, string> = {
    new: "新規登録",
    interview_scheduling: "面談調整中",
    interviewed: "面談済み",
    job_proposed: "求人提案中",
    applying: "応募中",
    in_selection: "選考中",
    offered: "内定",
    placed: "入社",
    failed: "不合格",
    closed: "対応終了",
  };

  const { data: allCandidates } = await supabase
    .from("candidates")
    .select("status")
    .eq("is_deleted", false);

  const statusMap: Record<string, number> = Object.fromEntries(
    Object.keys(STATUS_LABELS).map((k) => [k, 0])
  );
  (allCandidates ?? []).forEach((c) => {
    if (c.status in statusMap) statusMap[c.status]++;
  });
  const statusCounts = Object.entries(statusMap).map(([status, count]) => ({
    status: STATUS_LABELS[status],
    count,
  }));

  const { data: caRaw } = await supabase
    .from("candidates")
    .select("ca_id, ca:users!ca_id(name)")
    .eq("is_deleted", false)
    .not("ca_id", "is", null);

  const caMap: Record<string, { name: string; count: number }> = {};
  (caRaw ?? []).forEach((c: Record<string, unknown>) => {
    const caId = c.ca_id as string;
    const caName = (c.ca as { name?: string } | null)?.name ?? caId;
    if (!caMap[caId]) caMap[caId] = { name: caName, count: 0 };
    caMap[caId].count++;
  });
  const caCounts = Object.values(caMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ name, count }) => ({ ca: name, count }));

  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: needFollowUp } = await supabase
    .from("candidates")
    .select("id, name, status, updated_at, ca:users!ca_id(name)")
    .eq("is_deleted", false)
    .not("status", "in", '("placed","failed","closed")')
    .lte("updated_at", threeDaysAgo)
    .order("updated_at", { ascending: true })
    .limit(10);

  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: upcomingInterviews } = await supabase
    .from("interviews")
    .select("id, scheduled_at, application:applications(candidate:candidates(name), job:jobs(title, company:companies(name)))")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", weekEnd)
    .order("scheduled_at", { ascending: true })
    .limit(5);

  const currentMonth = now.getFullYear() + "年" + (now.getMonth() + 1) + "月";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">{currentMonth}の実績</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map(({ key, label, icon, color, target }) => (
          <KpiCard
            key={key}
            label={label}
            value={kpiThis[key]}
            icon={icon}
            color={color}
            prevValue={kpiPrev[key]}
            target={target}
          />
        ))}
      </div>

      <ActionItems
        needFollowUp={needFollowUp ?? []}
        upcomingInterviews={upcomingInterviews ?? []}
      />

      <DashboardCharts
        monthlyRegistrations={monthlyRegistrations}
        statusCounts={statusCounts}
        caCounts={caCounts}
      />
    </div>
  );
}
