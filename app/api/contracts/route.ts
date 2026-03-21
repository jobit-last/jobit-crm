import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "";
    const status = searchParams.get("status") || "";
    const company_id = searchParams.get("company_id") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const per_page = parseInt(searchParams.get("per_page") || "20", 10);

    let query = supabase
      .from("contracts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (title) query = query.ilike("title", `%${title}%`);
    if (status) query = query.eq("status", status);
    if (company_id) query = query.eq("company_id", company_id);

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: "認証が必要です", meta: {} },
        { status: 401 }
      );
    }

    const { company_id, title, content, status, start_date, end_date, file_url } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { success: false, data: null, message: "タイトルは必須です", meta: {} },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("contracts")
      .insert({
        company_id: company_id || null,
        title: title.trim(),
        content: content || null,
        status: status || "draft",
        start_date: start_date || null,
        end_date: end_date || null,
        file_url: file_url || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("create", `契約書作成: ${title.trim()}`);
    return NextResponse.json(
      { success: true, data, message: "契約書を登録しました", meta: {} },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
