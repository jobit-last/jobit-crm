import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";

// POST /api/auth - ログイン
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, data: null, message: "メールアドレスとパスワードは必須です", meta: {} },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 401 }
      );
    }

    await recordLog("login", `ユーザーログイン: ${email}`);

    return NextResponse.json({
      success: true,
      data: { userId: data.user.id, email: data.user.email },
      message: "ログインに成功しました",
      meta: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}

// DELETE /api/auth - ログアウト
export async function DELETE() {
  try {
    const supabase = await createClient();

    await recordLog("logout", "ユーザーログアウト");

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "ログアウトしました",
      meta: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}

// GET /api/auth - 現在のユーザー情報取得
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, data: null, message: "認証されていません", meta: {} },
        { status: 401 }
      );
    }

    // usersテーブルからプロフィール情報を取得
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: profile?.name ?? null,
        role: profile?.role ?? null,
      },
      message: "",
      meta: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}
