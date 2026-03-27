import { createClient } from "@/lib/supabase/server";
import KpiCard from "./KpiCard";
import DashboardCharts from "./DashboardCharts";

const KPI_CARDS = [
  { key: "new_candidates",  label: "今月の新規求職者",  icon: "👤", color: "#3B82F6" },
  { key: "interviewed",     label: "今月の面談数",       icon: "💬", color: "#8B5CF6" },
  { key: "in_selection",    label: "今月の面接数",       icon: "📋", color: "#F59E0B" },
  { key: "offered",         label: "今月の内定数",       icon: "🎉", color: "#10B981" },
  { key: "placed",          label: "今月の入社数",       icon: "🏢", color: "#002D37" },
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

  // 今月KPI
  const { data: thisMonthData } = await supabase
    .from("candidates")
    .select("status")
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd)
    .eq("is_deleted", false);

  const thisMonth = thisMonthData || [];
  const kpi = {
    new_candidates: thisMonth.filter((c) => c.status === "new").length,
    interviewed:    thisMonth.filter((c) => c.status === "interviewed").length,
    in_selection:   thisMonth.filter((c) => c.status === "in_selection").length,
    offered:        thisMonth.filter((c) => c.status === "offered").length,
    placed:         thisMonth.filter((c) => c.status === "placed").length,
  };

  // 月別登録数（過去12ヶ月）
  const { data: monthlyRaw } = await supabase
    .from("candidates")
    .select("created_at")
    .gte("created_at", twelveMonthsAgo)
    .eq("is_deleted", false);

  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = 0;
  }
  (monthlyRaw || []).forEach((c) => {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyMap) monthlyMap[key]++;
  });
  const monthlyRegistrations = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

  // ステータス別件数
  const STATUS_LABELS: Record<string, string> = {
    new: "新規登録", interview_scheduling: "面談調整中", interviewed: "面談済み",
    job_proposed: "求人提案中", applying: "応募中", in_selection: "選考中",
    offered: "内定", placed: "入社", failed: "不合格", closed: "対応終了",
  };
  const { data: allCandidates } = await supabase
    .from("candidates")
    .select("status")
    .eq("is_deleted", false);

  const statusMap: Record<string, number> = Object.fromEntries(Object.keys(STATUS_LABELS).map((k) => [k, 0]));
  (allCandidates || []).forEach((c) => { if (c.status in statusMap) statusMap[c.status]++; });
  const statusCounts = Object.entries(statusMap).map(([status, count]) => ({
    status: STATUS_LABELS[status],
    count,
  }));

  // CA別担当求職者数
  const { data: caRaw } = await supabase
    .from("candidates")
    .select("ca_id, ca:users!ca_id(name)")
    .eq("is_deleted", false)
    .not("ca_id", "is", null);

  const caMap: Record<string, { name: string; count: number }> = {};
  (caRaw || []).forEach((c: Record<string, unknown>) => {
    const caId = c.ca_id as string;
    const caName = (c.ca as { name?: string } | null)?.name ?? caId;
    if (!caMap[caId]) caMap[caId] = { name: caName, count: 0 };
    caMap[caId].count++;
  });
  const caCounts = Object.values(caMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ name, count }) => ({ ca: name, count }));

  const currentMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-primary">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">{currentMonth}の実績</p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map(({ key, label, icon, color }) => (
          <KpiCard
            key={key}
            label={label}
            value={kpi[key]}
            icon={icon}
            color={color}
          />
        ))}
      </div>

      {/* グラフ */}
      <DashboardCharts
        monthlyRegistrations={monthlyRegistrations}
        statusCounts={statusCounts}
        caCounts={caCounts}
      />
    </div>
  );
}
