import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getPeriodRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  switch (period) {
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
      return { from, to: lastTo };
    }
    case "3_months": {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
      return { from, to };
    }
    case "6_months": {
      const from = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
      return { from, to };
    }
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      return { from, to };
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "this_month";

    const { from, to } = getPeriodRange(period);

    const { data, error } = await supabase
      .from("candidates")
      .select("status, ca_id, ca:users!ca_id(name)")
      .gte("created_at", from)
      .lte("created_at", to)
      .eq("is_deleted", false)
      .not("ca_id", "is", null);

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    // CA別集計
    const caMap: Record<string, {
      ca: string;
      total: number;
      interviewed: number;
      applied: number;
      in_selection: number;
      offered: number;
      placed: number;
    }> = {};

    const INTERVIEWED_STATUSES  = ["interviewed", "job_proposed", "applying", "in_selection", "offered", "placed", "failed", "closed"];
    const APPLIED_STATUSES      = ["applying", "in_selection", "offered", "placed", "failed"];
    const IN_SELECTION_STATUSES = ["in_selection", "offered", "placed", "failed"];
    const OFFERED_STATUSES      = ["offered", "placed"];
    const PLACED_STATUSES       = ["placed"];

    (data || []).forEach((c: Record<string, unknown>) => {
      const caId   = c.ca_id as string;
      const caName = (c.ca as { name?: string } | null)?.name ?? caId;
      const status = c.status as string;

      if (!caMap[caId]) {
        caMap[caId] = { ca: caName, total: 0, interviewed: 0, applied: 0, in_selection: 0, offered: 0, placed: 0 };
      }

      caMap[caId].total++;
      if (INTERVIEWED_STATUSES.includes(status))  caMap[caId].interviewed++;
      if (APPLIED_STATUSES.includes(status))       caMap[caId].applied++;
      if (IN_SELECTION_STATUSES.includes(status))  caMap[caId].in_selection++;
      if (OFFERED_STATUSES.includes(status))       caMap[caId].offered++;
      if (PLACED_STATUSES.includes(status))        caMap[caId].placed++;
    });

    // 面談→面接転換率を付加し、担当数順にソート
    const ca_performance = Object.values(caMap)
      .map((ca) => ({
        ...ca,
        interview_to_selection_rate:
          ca.interviewed > 0
            ? Math.round((ca.in_selection / ca.interviewed) * 1000) / 10
            : 0,
        overall_rate:
          ca.total > 0
            ? Math.round((ca.placed / ca.total) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      data: { ca_performance },
      message: "",
      meta: { period, from, to },
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
