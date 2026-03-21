import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";
import type { MessageTemplateInsert } from "@/types/message-template";

// GET /api/templates — テンプレート一覧
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const type = searchParams.get("type");
  const name = searchParams.get("name");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("message_templates")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (type) query = query.eq("type", type);
  if (name) query = query.ilike("name", `%${name}%`);

  const { data, error, count } = await query;

  if (error) {
    return Response.json(
      { success: false, data: null, message: error.message, meta: {} },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    data,
    message: "",
    meta: { total: count ?? 0, page, limit },
  });
}

// POST /api/templates — テンプレート登録
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { success: false, data: null, message: "認証が必要です", meta: {} },
      { status: 401 }
    );
  }

  const body: MessageTemplateInsert = await request.json();

  if (!body.name || !body.type || !body.content) {
    return Response.json(
      { success: false, data: null, message: "name, type, content は必須です", meta: {} },
      { status: 400 }
    );
  }

  if (!["LINE", "SMS", "email"].includes(body.type)) {
    return Response.json(
      { success: false, data: null, message: "type は LINE / SMS / email のいずれかです", meta: {} },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("message_templates")
    .insert({ ...body, created_by: user.id })
    .select()
    .single();

  if (error) {
    return Response.json(
      { success: false, data: null, message: error.message, meta: {} },
      { status: 500 }
    );
  }

  await recordLog("create", `テンプレート作成: ${data.name}`);

  return Response.json(
    { success: true, data, message: "テンプレートを作成しました", meta: {} },
    { status: 201 }
  );
}
