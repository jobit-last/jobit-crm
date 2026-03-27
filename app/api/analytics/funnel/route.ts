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
      // this_month
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      return { from, to };
    }
  }
}

// 指定ステータス以上に到達した件数を計算
function countReached(statuses: string[], targetStatuses: string[]): number {
  return statuses.filter((s) => targetStatuses.includes(s)).length;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "this_month";

    const { from, to } = getPeriodRange(period);

    const { data, error } = await supabase
      .from("candidates")
      .select("status")
      .gte("created_at", from)
      .lte("created_at", to)
      .eq("is_deleted", false);

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    const statuses = (data || []).map((c) => c.status as string);
    const total = statuses.length;

    // ファネル各ステージの到達数
    // 面談: interviewed以降に進んだ求職者
    const interviewedStatuses = ["interviewed", "job_proposed", "applying", "in_selection", "offered", "placed", "failed", "closed"];
    // 応募: applying以降
    const applyingStatuses = ["applying", "in_selection", "offered", "placed", "failed"];
    // 書類通過 / 面接: in_selection以降
    const inSelectionStatuses = ["in_selection", "offered", "placed", "failed"];
    // 内定
    const offeredStatuses = ["offered", "placed"];
    // 入社
    const placedStatuses = ["placed"];

    const interviewed  = countReached(statuses, interviewedStatuses);
    const applied      = countReached(statuses, applyingStatuses);
    const inSelection  = countReached(statuses, inSelectionStatuses);
    const offered      = countReached(statuses, offeredStatuses);
    const placed       = countReached(statuses, placedStatuses);

    const funnel = [
      { stage: "登録", count: total,       rate: 100 },
      { stage: "面談",   count: interviewed, rate: total       > 0 ? Math.round((interviewed / total)       * 1000) / 10 : 0 },
      { stage: "応募",   count: applied,     rate: interviewed > 0 ? Math.round((applied     / interviewed) * 1000) / 10 : 0 },
      { stage: "面接",   count: inSelection, rate: applied     > 0 ? Math.round((inSelection / applied)     * 1000) / 10 : 0 },
      { stage: "内定",   count: offered,     rate: inSelection > 0 ? Math.round((offered     / inSelection) * 1000) / 10 : 0 },
      { stage: "入社",   count: placed,      rate: offered     > 0 ? Math.round((placed      / offered)     * 1000) / 10 : 0 },
    ];

    // 全体の歩留まり率（登録→入社）
    const overall_rate = total > 0 ? Math.round((placed / total) * 10000) / 100 : 0;

    return NextResponse.json({
      success: true,
      data: { funnel, overall_rate, total },
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
