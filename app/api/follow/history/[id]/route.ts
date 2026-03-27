import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/follow/history/[id] — 送信履歴詳細
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
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

  const { id } = await params;

  const { data, error } = await supabase
    .from("follow_logs")
    .select(
      `*,
      candidate:candidates!follow_logs_candidate_id_fkey(id, name, phone, email),
      template:message_templates!follow_logs_template_id_fkey(id, name, type)`
    )
    .eq("id", id)
    .single();

  if (error) {
    return Response.json(
      { success: false, data: null, message: "送信履歴が見つかりません", meta: {} },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data, message: "", meta: {} });
}
