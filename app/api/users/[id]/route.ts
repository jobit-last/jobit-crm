import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import type { UserUpdate } from "@/types/user";

// GET /api/users/[id] - ユーザー詳細取得
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: "認証が必要です", meta: {} },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
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

// PUT /api/users/[id] - ユーザー更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: "認証が必要です", meta: {} },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: UserUpdate = await request.json();

    const { data, error } = await supabase
      .from("users")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("update", `ユーザー更新: ${data.name ?? id}`);

    return NextResponse.json({
      success: true,
      data,
      message: "ユーザーを更新しました",
      meta: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - ユーザー削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: "認証が必要です", meta: {} },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("delete", `ユーザー削除: ${id}`);

    return NextResponse.json({
      success: true,
      data: null,
      message: "ユーザーを削除しました",
      meta: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "サーバーエラーが発生しました", meta: {} },
      { status: 500 }
    );
  }
}
