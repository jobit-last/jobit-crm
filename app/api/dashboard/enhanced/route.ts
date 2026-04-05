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

// 日数の差分を計算
function daysDifference(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "this_month";
    const ca_id = searchParams.get("ca_id");

    const { from, to } = getPeriodRange(period);

    // 1. KPI counts for the period
    let kpiQuery = supabase
      .from("candidates")
      .select("id, status, created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .eq("is_deleted", false);

    if (ca_id) {
      kpiQuery = kpiQuery.eq("ca_id", ca_id);
    }

    const { data: kpiData, error: kpiError } = await kpiQuery;

    if (kpiError) {
      return NextResponse.json(
        { success: false, data: null, message: kpiError.message, meta: {} },
        { status: 500 }
      );
    }

    const candidates = kpiData || [];
    const kpi = {
      new_candidates: candidates.filter((c) => c.status === "new").length,
      interviewed: candidates.filter((c) => c.status === "interviewed").length,
      in_selection: candidates.filter((c) => c.status === "in_selection").length,
      offered: candidates.filter((c) => c.status === "offered").length,
      placed: candidates.filter((c) => c.status === "placed").length,
    };

    // 2. Funnel data with pessimistic and optimistic conversion rates
    const statuses = candidates.map((c) => c.status as string);
    const total = statuses.length;

    // Status classifications for funnel stages
    const interviewedStatuses = [
      "interviewed",
      "job_proposed",
      "applying",
      "in_selection",
      "offered",
      "placed",
      "failed",
      "closed",
    ];
    const applyingStatuses = ["applying", "in_selection", "offered", "placed", "failed"];
    const inSelectionStatuses = ["in_selection", "offered", "placed", "failed"];
    const offeredStatuses = ["offered", "placed"];
    const placedStatuses = ["placed"];

    const interviewed = countReached(statuses, interviewedStatuses);
    const applied = countReached(statuses, applyingStatuses);
    const inSelection = countReached(statuses, inSelectionStatuses);
    const offered = countReached(statuses, offeredStatuses);
    const placed = countReached(statuses, placedStatuses);

    // Calculate conversion rates for pessimistic/optimistic bounds
    const rate_to_interview = total > 0 ? interviewed / total : 0;
    const rate_interview_to_apply = interviewed > 0 ? applied / interviewed : 0;
    const rate_apply_to_selection = applied > 0 ? inSelection / applied : 0;
    const rate_selection_to_offer = inSelection > 0 ? offered / inSelection : 0;
    const rate_offer_to_place = offered > 0 ? placed / offered : 0;

    // Pessimistic: 70% of conversion rates
    const pessimistic_interviewed = Math.floor(total * rate_to_interview * 0.7);
    const pessimistic_applied = Math.floor(pessimistic_interviewed * rate_interview_to_apply * 0.7);
    const pessimistic_inSelection = Math.floor(pessimistic_applied * rate_apply_to_selection * 0.7);
    const pessimistic_offered = Math.floor(pessimistic_inSelection * rate_selection_to_offer * 0.7);
    const pessimistic_placed = Math.floor(
      pessimistic_offered * rate_offer_to_place * 0.7
    );

    // Optimistic: 130% of conversion rates, capped at 100%
    const optimistic_interviewed = Math.floor(
      Math.min(total * rate_to_interview * 1.3, total)
    );
    const optimistic_applied = Math.floor(
      Math.min(optimistic_interviewed * rate_interview_to_apply * 1.3, optimistic_interviewed)
    );
    const optimistic_inSelection = Math.floor(
      Math.min(optimistic_applied * rate_apply_to_selection * 1.3, optimistic_applied)
    );
    const optimistic_offered = Math.floor(
      Math.min(optimistic_inSelection * rate_selection_to_offer * 1.3, optimistic_inSelection)
    );
    const optimistic_placed = Math.floor(
      Math.min(optimistic_offered * rate_offer_to_place * 1.3, optimistic_offered)
    );

    const funnel = [
      {
        stage: "登録",
        count: total,
        rate: 100,
        pessimistic_count: total,
        optimistic_count: total,
      },
      {
        stage: "面談",
        count: interviewed,
        rate: total > 0 ? Math.round((interviewed / total) * 1000) / 10 : 0,
        pessimistic_count: pessimistic_interviewed,
        optimistic_count: optimistic_interviewed,
      },
      {
        stage: "応募",
        count: applied,
        rate: interviewed > 0 ? Math.round((applied / interviewed) * 1000) / 10 : 0,
        pessimistic_count: pessimistic_applied,
        optimistic_count: optimistic_applied,
      },
      {
        stage: "面接",
        count: inSelection,
        rate: applied > 0 ? Math.round((inSelection / applied) * 1000) / 10 : 0,
        pessimistic_count: pessimistic_inSelection,
        optimistic_count: optimistic_inSelection,
      },
      {
        stage: "内定",
        count: offered,
        rate: inSelection > 0 ? Math.round((offered / inSelection) * 1000) / 10 : 0,
        pessimistic_count: pessimistic_offered,
        optimistic_count: optimistic_offered,
      },
      {
        stage: "入社",
        count: placed,
        rate: offered > 0 ? Math.round((placed / offered) * 1000) / 10 : 0,
        pessimistic_count: pessimistic_placed,
        optimistic_count: optimistic_placed,
      },
    ];

    // Overall conversion rate (登録→入社)
    const overall_rate = total > 0 ? Math.round((placed / total) * 10000) / 100 : 0;

    // 3. Lead time calculation: average days from "interviewed" to "offered"
    let leadTimeQuery = supabase
      .from("candidate_status_histories")
      .select("candidate_id, to_status, changed_at")
      .eq("to_status", "offered");

    if (ca_id) {
      // We need to join with candidates to filter by ca_id
      leadTimeQuery = leadTimeQuery.in(
        "candidate_id",
        candidates.map((c) => c.id)
      );
    }

    const { data: offeredHistories, error: offeredError } = await leadTimeQuery;

    if (offeredError) {
      return NextResponse.json(
        { success: false, data: null, message: offeredError.message, meta: {} },
        { status: 500 }
      );
    }

    const leadTimes: number[] = [];

    if (offeredHistories && offeredHistories.length > 0) {
      // For each candidate that reached "offered" status
      for (const offered of offeredHistories) {
        const candidateId = offered.candidate_id as string;
        const offeredDate = offered.changed_at as string;

        // Find the earliest "interviewed" status change for this candidate
        const { data: interviewHistories, error: interviewError } = await supabase
          .from("candidate_status_histories")
          .select("changed_at")
          .eq("candidate_id", candidateId)
          .eq("to_status", "interviewed")
          .order("changed_at", { ascending: true })
          .limit(1);

        if (!interviewError && interviewHistories && interviewHistories.length > 0) {
          const interviewDate = interviewHistories[0].changed_at as string;
          const days = daysDifference(interviewDate, offeredDate);
          if (days >= 0) {
            leadTimes.push(days);
          }
        }
      }
    }

    const lead_time = {
      avg_days: leadTimes.length > 0 ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) : 0,
      min_days: leadTimes.length > 0 ? Math.min(...leadTimes) : 0,
      max_days: leadTimes.length > 0 ? Math.max(...leadTimes) : 0,
    };

    // 4. Monthly registration trend (12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

    let monthlyQuery = supabase
      .from("candidates")
      .select("created_at")
      .gte("created_at", twelveMonthsAgo)
      .eq("is_deleted", false);

    if (ca_id) {
      monthlyQuery = monthlyQuery.eq("ca_id", ca_id);
    }

    const { data: allCandidatesData, error: monthlyError } = await monthlyQuery;

    if (monthlyError) {
      return NextResponse.json(
        { success: false, data: null, message: monthlyError.message, meta: {} },
        { status: 500 }
      );
    }

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

    const monthly = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }));

    // 5. CA list for the dropdown filter
    const { data: casData, error: casError } = await supabase
      .from("candidates")
      .select("ca_id, ca:users!ca_id(id, name)")
      .eq("is_deleted", false)
      .not("ca_id", "is", null)
      .not("ca", "is", null);

    if (casError) {
      return NextResponse.json(
        { success: false, data: null, message: casError.message, meta: {} },
        { status: 500 }
      );
    }

    // Get unique CAs
    const caMap: Record<string, string> = {};
    (casData || []).forEach((c: Record<string, unknown>) => {
      const caId = c.ca_id as string;
      const caName = (c.ca as { name?: string } | null)?.name ?? caId;
      if (!caMap[caId]) {
        caMap[caId] = caName;
      }
    });

    const cas = Object.entries(caMap).map(([id, name]) => ({ id, name }));

    return NextResponse.json({
      success: true,
      data: {
        kpi,
        funnel,
        lead_time,
        monthly,
        cas,
        overall_rate,
        total,
      },
      message: "",
      meta: { period, from, to, ca_id },
    });
  } catch (error) {
    console.error("Enhanced dashboard error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
