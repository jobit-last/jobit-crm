import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "confirmed", "paid", "cancelled"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const ca_id = searchParams.get("ca_id") || "";
    const month = searchParams.get("month") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const per_page = parseInt(searchParams.get("per_page") || "50", 10);

    let query = supabase
      .from("sales")
      .select(
        "*, ca:users!sales_ca_id_fkey(id, name), candidate:candidates(id, name), company:companies(id, name)",
        { count: "exact" }
      )
      .order("month", { ascending: false })
      .order("created_at", { ascending: false });

    if (ca_id)  query = query.eq("ca_id", ca_id);
    if (month)  query = query.eq("month", month);
    if (status) query = query.eq("status", status);

    const from = (page - 1) * per_page;
    query = query.range(from, from + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: [], message: error.message, meta: {} },
        { status: 500 }
      );
    }

    // æå¥ã»CAå¥ã®éè¨ãã¼ã¿ãè¿ã
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    // éè¨ã¯ã¨ãª
    let summaryQuery = supabase
      .from("sales")
      .select("month, ca_id, amount, status, ca:users!sales_ca_id_fkey(id, name)")
      .in("month", months)
      .neq("status", "cancelled");

    if (ca_id) summaryQuery = summaryQuery.eq("ca_id", ca_id);

    const { data: summaryData } = await summaryQuery;

    // æå¥éè¨
    const monthlyTotals = months.map((m) => {
      const monthRecords = (summaryData || []).filter((s) => s.month === m);
      return {
        month: m,
        total: monthRecords.reduce((sum, s) => sum + (s.amount || 0), 0),
        count: monthRecords.length,
      };
    });

    // CAå¥éè¨
    const caMap: Record<string, { id: string; name: string; total: number; count: number }> = {};
    (summaryData || []).forEach((s: Record<string, unknown>) => {
      const caId = s.ca_id as string;
      const ca = s.ca as { id: string; name: string } | null;
      if (!caId) return;
      if (!caMap[caId]) {
        caMap[caId] = {
          id: caId,
          name: ca?.name || "ä¸æ",
          total: 0,
          count: 0,
        };
      }
      caMap[caId].total += (s.amount as number) || 0;
      caMap[caId].count += 1;
    });

    const caTotals = Object.values(caMap).sort((a, b) => b.total - a.total);

    // CAä¸è¦§ï¼ãã£ã«ã¿ç¨ï¼
    const { data: casData } = await supabase
      .from("users")
      .select("id, name")
      .in("role", ["ca", "admin"])
      .order("name");

    const total = count || 0;
    return NextResponse.json({
      success: true,
      data: data || [],
      message: "",
      meta: {
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
        monthly_totals: monthlyTotals,
        ca_totals: caTotals,
        cas: casData || [],
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, data: [], message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { ca_id, candidate_id, company_id, amount, month, status, notes } = body;

    if (!amount || !month) {
      return NextResponse.json(
        { success: false, data: null, message: "éé¡ã¨æã¯å¿é ã§ã" },
        { status: 400 }
      );
    }

    const safeStatus = VALID_STATUSES.includes(status) ? status : "pending";

    const { data, error } = await supabase
      .from("sales")
      .insert({
        ca_id: ca_id || null,
        candidate_id: candidate_id || null,
        company_id: company_id || null,
        amount: parseInt(amount, 10),
        month,
        status: safeStatus,
        notes: notes || null,
      })
      .select("*, ca:users!sales_ca_id_fkey(id, name), candidate:candidates(id, name), company:companies(id, name)")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: "å£²ä¸ãç»é²ãã¾ãã" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
