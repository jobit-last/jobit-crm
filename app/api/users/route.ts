import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordLog } from "@/lib/activity-log";
import type { UserInsert } from "@/types/user";

// GET /api/users - ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      meta: {
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "サーバーエラーが発生しました",
        meta: {},
      },
      { status: 500 }
    );
  }
}

// POST /api/users - ユーザー作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
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
        {
          success: false,
          data: null,
          message: "メールアドレスは必須です",
          meta: {},
        },
        { status: 400 }
      );
    }

    // 1. Supabase Auth にユーザーを作成（Admin API使用）
    const adminClient = createAdminClient();
    const tempPassword = `Jobit!${Date.now().toString(36)}`;

    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email: body.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: body.name,
          role: body.role,
        },
      });

    if (authError) {
      // メールアドレス重複チェック
      if (authError.message?.includes("already been registered")) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: "このメールアドレスは既に登録されています",
            meta: {},
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, data: null, message: authError.message, meta: {} },
        { status: 500 }
      );
    }

    // 2. public.users テーブルにレコード作成（auth.users の ID を使用）
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: authUser.user.id,
        name: body.name,
        email: body.email,
        role: body.role,
      })
      .select()
      .single();

    if (error) {
      // public.users 作成失敗時は auth ユーザーも削除
      await adminClient.auth.admin.deleteUser(authUser.user.id);
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
      {
        success: false,
        data: null,
        message: "サーバーエラーが発生しました",
        meta: {},
      },
      { status: 500 }
    );
  }
}
