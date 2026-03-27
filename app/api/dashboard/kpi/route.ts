import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // 今月のKPI（ステータス別カウント）
    const { data: thisMonthData } = await supabase
      .from("candidates")
      .select("status, created_at")
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd)
      .eq("is_deleted", false);

    const thisMonth = thisMonthData || [];

    const kpi = {
      new_candidates: thisMonth.filter((c) => c.status === "new").length,
      interviewed: thisMonth.filter((c) => c.status === "interviewed").length,
      in_selection: thisMonth.filter((c) => c.status === "in_selection").length,
      offered: thisMonth.filter((c) => c.status === "offered").length,
      placed: thisMonth.filter((c) => c.status === "placed").length,
    };

    // 月別求職者登録数（過去12ヶ月）
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

    const { data: allCandidatesData } = await supabase
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
    (allCandidatesData || []).forEach((c) => {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyMap) monthlyMap[key]++;
    });
    const monthly_registrations = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }));

    // 選考ステータス別件数（全件・アクティブ）
    const { data: allCandidates } = await supabase
      .from("candidates")
      .select("status")
      .eq("is_deleted", false);

    const statusMap: Record<string, number> = {
      new: 0,
      interview_scheduling: 0,
      interviewed: 0,
      job_proposed: 0,
      applying: 0,
      in_selection: 0,
      offered: 0,
      placed: 0,
      failed: 0,
      closed: 0,
    };
    (allCandidates || []).forEach((c) => {
      if (c.status in statusMap) statusMap[c.status]++;
    });

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

    const status_counts = Object.entries(statusMap).map(([status, count]) => ({
      status: STATUS_LABELS[status] ?? status,
      count,
    }));

    // CA別担当求職者数（上位10名）
    const { data: caData } = await supabase
      .from("candidates")
      .select("ca_id, ca:users!ca_id(name)")
      .eq("is_deleted", false)
      .not("ca_id", "is", null);

    const caMap: Record<string, { name: string; count: number }> = {};
    (caData || []).forEach((c: Record<string, unknown>) => {
      const caId = c.ca_id as string;
      const caName = (c.ca as { name?: string } | null)?.name ?? caId;
      if (!caMap[caId]) caMap[caId] = { name: caName, count: 0 };
      caMap[caId].count++;
    });

    const ca_counts = Object.values(caMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ name, count }) => ({ ca: name, count }));

    return NextResponse.json({
      success: true,
      data: { kpi, monthly_registrations, status_counts, ca_counts },
      message: "",
      meta: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
