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

interface CaStats {
  ca: string;
  applied: number;
  setup: number;
  conducted: number;
  conducted_noshow: number;
  conducted_declined: number;
  supporting: number;
  support_noshow: number;
  support_declined: number;
  support_released: number;
  offered: number;
  offer_noshow: number;
  offer_declined: number;
  offer_accepted: number;
  accepted_noshow: number;
  accepted_declined: number;
  placed: number;
}

// ステータスが「到達済み」かどうかを判定するヘルパー
const SETUP_REACHED = ["setup", "conducted", "supporting", "offered", "offer_accepted", "placed",
  "conducted_noshow", "conducted_declined", "support_noshow", "support_declined", "support_released",
  "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
const CONDUCTED_REACHED = ["conducted", "supporting", "offered", "offer_accepted", "placed",
  "conducted_noshow", "conducted_declined", "support_noshow", "support_declined", "support_released",
  "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
const SUPPORTING_REACHED = ["supporting", "offered", "offer_accepted", "placed",
  "support_noshow", "support_declined", "support_released",
  "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
const OFFERED_REACHED = ["offered", "offer_accepted", "placed",
  "offer_noshow", "offer_declined", "accepted_noshow", "accepted_declined"];
const ACCEPTED_REACHED = ["offer_accepted", "placed", "accepted_noshow", "accepted_declined"];

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

    const caMap: Record<string, CaStats> = {};

    (data || []).forEach((c: Record<string, unknown>) => {
      const caId = c.ca_id as string;
      const caName = (c.ca as { name?: string } | null)?.name ?? caId;
      const status = c.status as string;

      if (!caMap[caId]) {
        caMap[caId] = {
          ca: caName, applied: 0, setup: 0, conducted: 0,
          conducted_noshow: 0, conducted_declined: 0,
          supporting: 0, support_noshow: 0, support_declined: 0, support_released: 0,
          offered: 0, offer_noshow: 0, offer_declined: 0,
          offer_accepted: 0, accepted_noshow: 0, accepted_declined: 0,
          placed: 0,
        };
      }

      caMap[caId].applied++;
      if (SETUP_REACHED.includes(status)) caMap[caId].setup++;
      if (CONDUCTED_REACHED.includes(status)) caMap[caId].conducted++;
      if (status === "conducted_noshow") caMap[caId].conducted_noshow++;
      if (status === "conducted_declined") caMap[caId].conducted_declined++;
      if (SUPPORTING_REACHED.includes(status)) caMap[caId].supporting++;
      if (status === "support_noshow") caMap[caId].support_noshow++;
      if (status === "support_declined") caMap[caId].support_declined++;
      if (status === "support_released") caMap[caId].support_released++;
      if (OFFERED_REACHED.includes(status)) caMap[caId].offered++;
      if (status === "offer_noshow") caMap[caId].offer_noshow++;
      if (status === "offer_declined") caMap[caId].offer_declined++;
      if (ACCEPTED_REACHED.includes(status)) caMap[caId].offer_accepted++;
      if (status === "accepted_noshow") caMap[caId].accepted_noshow++;
      if (status === "accepted_declined") caMap[caId].accepted_declined++;
      if (status === "placed") caMap[caId].placed++;
    });

    const ca_performance = Object.values(caMap)
      .sort((a, b) => b.applied - a.applied);

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
