import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import type { UserInsert } from "@/types/user";

// GET /api/users - ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: "認証が必要です", meta: {} },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const per_page = parseInt(searchParams.get("per_page") ?? "20");
    const role = searchParams.get("role") || "";
    const name = searchParams.get("name") || "";

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (role) query = query.eq("role", role);
    if (name) query = query.ilike("name", `%${name}%`);

    const from = (page - 1) * per_page;
    query = query.range(from, from + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    return NextResponse.json({
      success: true,
      data,
      message: "",
      meta: { total, page, per_page, total_pages: Math.ceil(total / per_page) },
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}

// POST /api/users - ユーザー作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: "認証が必要です", meta: {} },
        { status: 401 }
      );
    }

    const body: UserInsert = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, data: null, message: "名前は必須です", meta: {} },
        { status: 400 }
      );
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { success: false, data: null, message: "メールアドレスは必須です", meta: {} },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("create", `ユーザー作成: ${body.name} (${body.email})`);

    return NextResponse.json(
      { success: true, data, message: "ユーザーを作成しました", meta: {} },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}
