import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// GET /api/follow/history — 送信履歴一覧
export async function GET(request: NextRequest) {
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

  const { searchParams } = request.nextUrl;

  const candidate_id = searchParams.get("candidate_id");
  const type         = searchParams.get("type");
  const status       = searchParams.get("status");
  const date_from    = searchParams.get("date_from");
  const date_to      = searchParams.get("date_to");
  const page         = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit        = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const from         = (page - 1) * limit;
  const to           = from + limit - 1;

  let query = supabase
    .from("follow_logs")
    .select(
      `*,
      candidate:candidates!follow_logs_candidate_id_fkey(id, name, phone, email),
      template:message_templates!follow_logs_template_id_fkey(id, name, type)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (candidate_id) query = query.eq("candidate_id", candidate_id);
  if (type)         query = query.eq("type", type);
  if (status)       query = query.eq("status", status);
  if (date_from)    query = query.gte("created_at", `${date_from}T00:00:00`);
  if (date_to)      query = query.lte("created_at", `${date_to}T23:59:59`);

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
