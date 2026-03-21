import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";
import type { MessageTemplateUpdate } from "@/types/message-template";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/templates/[id] — テンプレート詳細
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return Response.json(
      { success: false, data: null, message: "テンプレートが見つかりません", meta: {} },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data, message: "", meta: {} });
}

// PUT /api/templates/[id] — テンプレート更新
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const supabase = await createClient();
  const { id } = await params;
  const body: MessageTemplateUpdate = await request.json();

  if (body.type && !["LINE", "SMS", "email"].includes(body.type)) {
    return Response.json(
      { success: false, data: null, message: "type は LINE / SMS / email のいずれかです", meta: {} },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("message_templates")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json(
      { success: false, data: null, message: error.message, meta: {} },
      { status: 500 }
    );
  }

  await recordLog("update", `テンプレート更新: ${data.name}`);

  return Response.json({ success: true, data, message: "テンプレートを更新しました", meta: {} });
}

// DELETE /api/templates/[id] — テンプレート削除
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const supabase = await createClient();
  const { id } = await params;

  // 削除前にレコードを取得（ログ用）
  const { data: template } = await supabase
    .from("message_templates")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json(
      { success: false, data: null, message: error.message, meta: {} },
      { status: 500 }
    );
  }

  await recordLog("delete", `テンプレート削除: ${template?.name ?? id}`);

  return Response.json({ success: true, data: null, message: "テンプレートを削除しました", meta: {} });
}
