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

    // ファネル各ステージの到達数（新ステータス体系）
    // 応募: 全件
    const appliedCount = total;

    // 設置: setup以降に進んだ求職者
    const SETUP_REACHED = ["setup", "conducted", "supporting", "offered", "offer_accepted", "placed",
      "conducted_noshow", "conducted_declined", "support_noshow", "support_declined", "support_released",
      "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
    const setupCount = countReached(statuses, SETUP_REACHED);

    // 実施: conducted以降
    const CONDUCTED_REACHED = ["conducted", "supporting", "offered", "offer_accepted", "placed",
      "conducted_noshow", "conducted_declined", "support_noshow", "support_declined", "support_released",
      "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
    const conductedCount = countReached(statuses, CONDUCTED_REACHED);

    // 実施後の離脱
    const conductedNoshow = countReached(statuses, ["conducted_noshow"]);
    const conductedDeclined = countReached(statuses, ["conducted_declined"]);

    // サポート中: supporting以降
    const SUPPORTING_REACHED = ["supporting", "offered", "offer_accepted", "placed",
      "support_noshow", "support_declined", "support_released",
      "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
    const supportingCount = countReached(statuses, SUPPORTING_REACHED);

    // サポート後の離脱
    const supportNoshow = countReached(statuses, ["support_noshow"]);
    const supportDeclined = countReached(statuses, ["support_declined"]);
    const supportReleased = countReached(statuses, ["support_released"]);

    // 内定: offered以降
    const OFFERED_REACHED = ["offered", "offer_accepted", "placed",
      "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
    const offeredCount = countReached(statuses, OFFERED_REACHED);

    // 内定後の離脱
    const offerNoshow = countReached(statuses, ["offer_noshow"]);
    const offerDeclined = countReached(statuses, ["offer_declined"]);

    // 内定承諾: offer_accepted以降
    const ACCEPTED_REACHED = ["offer_accepted", "placed", "accepted_noshow", "accepted_declined"];
    const acceptedCount = countReached(statuses, ACCEPTED_REACHED);

    // 承諾後の離脱
    const acceptedNoshow = countReached(statuses, ["accepted_noshow"]);
    const acceptedDeclined = countReached(statuses, ["accepted_declined"]);

    // 入社
    const placedCount = countReached(statuses, ["placed"]);

    const pctCalc = (num: number, den: number) =>
      den > 0 ? Math.round((num / den) * 1000) / 10 : 0;

    const funnel = [
      { stage: "応募", count: appliedCount, rate: 100 },
      { stage: "設置", count: setupCount, rate: pctCalc(setupCount, appliedCount) },
      { stage: "実施", count: conductedCount, rate: pctCalc(conductedCount, setupCount) },
      { stage: "サポート", count: supportingCount, rate: pctCalc(supportingCount, conductedCount) },
      { stage: "内定", count: offeredCount, rate: pctCalc(offeredCount, supportingCount) },
      { stage: "承諾", count: acceptedCount, rate: pctCalc(acceptedCount, offeredCount) },
      { stage: "入社", count: placedCount, rate: pctCalc(placedCount, acceptedCount) },
    ];

    // サブステータス詳細
    const subStatuses = {
      conducted: { noshow: conductedNoshow, declined: conductedDeclined },
      supporting: { noshow: supportNoshow, declined: supportDeclined, released: supportReleased },
      offered: { noshow: offerNoshow, declined: offerDeclined },
      accepted: { noshow: acceptedNoshow, declined: acceptedDeclined },
    };

    // 全体の歩留まり率（応募→入社）
    const overall_rate = total > 0
      ? Math.round((placedCount / total) * 10000) / 100
      : 0;

    return NextResponse.json({
      success: true,
      data: { funnel, subStatuses, overall_rate, total },
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
