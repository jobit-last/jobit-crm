import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, MAIN_STATUSES, SUB_STATUSES } from "@/types/candidate";
import type { CandidateStatus } from "@/types/candidate";
import KpiCard from "./KpiCard";
import DashboardCharts from "./DashboardCharts";
import ActionItems from "./ActionItems";

const KPI_CARDS = [
  { key: "new_candidates", label: "今月の新規求職者", icon: "👤", color: "#3B82F6", target: 10 },
  { key: "conducted", label: "今月の実施数", icon: "💬", color: "#8B5CF6", target: 8 },
  { key: "supporting", label: "サポート中", icon: "📋", color: "#F59E0B", target: 5 },
  { key: "offered", label: "今月の内定数", icon: "🎉", color: "#10B981", target: 3 },
  { key: "placed", label: "今月の入社数", icon: "🏢", color: "#002D37", target: 2 },
] as const;

type KpiKey = (typeof KPI_CARDS)[number]["key"];

// 終了ステータべ（フォローアップ不要）
const TERMINAL_STATUSES: CandidateStatus[] = [
  "placed",
  "conducted_noshow", "conducted_declined",
  "support_noshow", "support_declined", "support_released",
  "offer_noshow", "offer_declined",
  "accepted_noshow", "accepted_declined",
];

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
    conducted: active.filter(
      (c) => c.status === "conducted" && c.updated_at >= monthStart && c.updated_at <= monthEnd
    ).length || (thisMonthAll ?? []).filter((c) => c.status === "conducted").length,
    supporting: active.filter(
      (c) => c.status === "supporting" && c.updated_at >= monthStart && c.updated_at <= monthEnd
    ).length || (thisMonthAll ?? []).filter((c) => c.status === "supporting").length,
    offered: active.filter(
      (c) => c.status === "offered" && c.updated_at >= monthStart && c.updated_at <= monthEnd
    ).length || (thisMonthAll ?? []).filter((c) => c.status === "offered").length,
    placed: active.filter(
      (c) => c.status === "placed" && c.updated_at >= monthStart && c.updated_at <= monthEnd
    ).length || (thisMonthAll ?? []).filter((c) => c.status === "placed").length,
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
    conducted: prevMonth.filter((c) => c.status === "conducted").length,
    supporting: prevMonth.filter((c) => c.status === "supporting").length,
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
  const monthlyRegistrations = Object.entries(monthlyMap).map(([month, count]) => ({
    month,
    count,
  }));

  // ステータス別集計（types/candidate.tsのSTATUS_LABELSを使用）
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
  const statusCounts = Object.entries(statusMap)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status: STATUS_LABELS[status as CandidateStatus],
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

  // フォローアップ必要（終了ステータス以外にs日以上更新なし）
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const terminalList = TERMINAL_STATUSES.map((s) => `"${s}"`).join(",");
  const { data: needFollowUp } = await supabase
    .from("candidates")
    .select("id, name, status, updated_at, ca:users!ca_id(name)")
    .eq("is_deleted", false)
    .not("status", "in", `(${terminalList})`)
    .lte("updated_at", threeDaysAgo)
    .order("updated_at", { ascending: true })
    .limit(10);

  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: upcomingInterviews } = await supabase
    .from("interviews")
    .select(
      "id, scheduled_at, application:applications(candidate:candidates(name), job:jobs(title, company:companies(name)))"
    )
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
        needFollowUp={(needFollowUp ?? []) as any}
        upcomingInterviews={(upcomingInterviews ?? []) as any}
      />

      <DashboardCharts
        monthlyRegistrations={monthlyRegistrations}
        statusCounts={statusCounts}
        caCounts={caCounts}
      />
    </div>
  );
}
