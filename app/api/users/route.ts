import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import type { UserInsert } from "@/types/user";

/** LD-XXXX 形式の連番IDを生成 */
async function generateLdLoginId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const { data } = await supabase
    .from("users")
    .select("ld_login_id")
    .not("ld_login_id", "is", null)
    .order("ld_login_id", { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (data && data.length > 0 && data[0].ld_login_id) {
    const match = data[0].ld_login_id.match(/LD-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }

  return `LD-${String(nextNum).padStart(4, "0")}`;
}

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

    const body = await request.json();
    const { create_ld_account, ...userData } = body as UserInsert & { create_ld_account?: boolean };

    if (!userData.name?.trim()) {
      return NextResponse.json(
        { success: false, data: null, message: "名前は必須です", meta: {} },
        { status: 400 }
      );
    }

    if (!userData.email?.trim()) {
      return NextResponse.json(
        { success: false, data: null, message: "メールアドレスは必須です", meta: {} },
        { status: 400 }
      );
    }

    let ldLoginId: string | null = null;

    // LDアカウント作成が要求された場合
    if (create_ld_account) {
      ldLoginId = await generateLdLoginId(supabase);

      // Supabase Auth でLDユーザーを作成（初期パスワード = ログインID）
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      if (serviceKey) {
        const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            password: ldLoginId,
            email_confirm: true,
          }),
        });

        if (!authRes.ok) {
          const authErr = await authRes.json();
          return NextResponse.json(
            { success: false, data: null, message: `LDアカウント作成に失敗しました: ${authErr.msg || authErr.message || JSON.stringify(authErr)}`, meta: {} },
            { status: 500 }
          );
        }
      } else {
        const authRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: {
            apikey: anonKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            password: ldLoginId,
          }),
        });

        if (!authRes.ok) {
          const authErr = await authRes.json();
          return NextResponse.json(
            { success: false, data: null, message: `LDアカウント作成に失敗しました: ${authErr.msg || authErr.message || JSON.stringify(authErr)}`, meta: {} },
            { status: 500 }
          );
        }
      }
    }

    const insertData = {
      ...userData,
      ...(ldLoginId ? { ld_login_id: ldLoginId } : {}),
    };

    const { data, error } = await supabase
      .from("users")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("create", `ユーザー作成: ${userData.name} (${userData.email})${ldLoginId ? ` [${ldLoginId}]` : ""}`);

    return NextResponse.json(
      { success: true, data, message: "ユーザーを作成しました", meta: {}, ld_login_id: ldLoginId },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}
