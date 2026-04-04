import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";

const ALLOWED_SORT_COLUMNS = ["name", "industry", "company_size", "temperature", "created_at"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const name = searchParams.get("name") || "";
    const industry = searchParams.get("industry") || "";
    const temperature = searchParams.get("temperature") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const per_page = parseInt(searchParams.get("per_page") || "20", 10);
    const sort_by = searchParams.get("sort_by") || "created_at";
    const sort_order = searchParams.get("sort_order") === "asc";

    const safeSortBy = ALLOWED_SORT_COLUMNS.includes(sort_by) ? sort_by : "created_at";

    let query = supabase.from("companies").select("*", { count: "exact" });

    if (name) query = query.ilike("name", `%${name}%`);
    if (industry) query = query.ilike("industry", `%${industry}%`);
    if (temperature) query = query.eq("temperature", temperature);

    query = query.order(safeSortBy, { ascending: sort_order });

    const from = (page - 1) * per_page;
    query = query.range(from, from + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: [], message: error.message, meta: {} },
        { status: 500 }
      );
    }

    const total = count || 0;
    return NextResponse.json({
      success: true,
      data: data || [],
      message: "",
      meta: { total, page, per_page, total_pages: Math.ceil(total / per_page) },
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

    const { name, industry, company_size, location, website,
            contact_name, contact_email, contact_phone, temperature, ra_id, notes } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, data: null, message: "企業名は必須です", meta: {} },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: name.trim(),
        industry: industry || null,
        company_size: company_size || null,
        location: location || null,
        website: website || null,
        contact_name: contact_name || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        temperature: temperature || null,
        ra_id: ra_id || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("create", `企業作成: ${name.trim()}`);
    return NextResponse.json(
      { success: true, data, message: "企業を登録しました", meta: {} },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
