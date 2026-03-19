import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const { to_status } = await request.json();

  if (!to_status) {
    return Response.json({ error: "to_status は必須です" }, { status: 400 });
  }

  // 現在のステータスを取得
  const { data: current, error: fetchError } = await supabase
    .from("candidates")
    .select("status")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (fetchError || !current) {
    return Response.json({ error: "求職者が見つかりません" }, { status: 404 });
  }

  if (current.status === to_status) {
    return Response.json({ error: "同じステータスには変更できません" }, { status: 400 });
  }

  // ログインユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date().toISOString();

  // candidates.status を更新 と 履歴挿入 を並行実行
  const [{ error: updateError }, { error: historyError }] = await Promise.all([
    supabase
      .from("candidates")
      .update({ status: to_status, updated_at: now })
      .eq("id", id),
    supabase
      .from("candidate_status_histories")
      .insert({
        candidate_id: id,
        from_status: current.status,
        to_status,
        changed_by: user?.id ?? null,
        changed_at: now,
      }),
  ]);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }
  if (historyError) {
    return Response.json({ error: historyError.message }, { status: 500 });
  }

  return Response.json({ ok: true, from_status: current.status, to_status });
}
