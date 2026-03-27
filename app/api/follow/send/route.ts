import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";
import type { FollowType, FollowLogInsert } from "@/types/follow-log";

const VALID_TYPES: FollowType[] = ["面談リマインド", "面接リマインド", "入社後フォロー", "リサポ連絡"];

// POST /api/follow/send — フォロー送信（記録）
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

  const body: {
    candidate_id?: string;
    template_id?: string;
    type?: FollowType;
    content?: string;
  } = await request.json();

  // バリデーション
  if (!body.candidate_id) {
    return Response.json(
      { success: false, data: null, message: "candidate_id は必須です", meta: {} },
      { status: 400 }
    );
  }
  if (!body.type || !VALID_TYPES.includes(body.type)) {
    return Response.json(
      {
        success: false,
        data: null,
        message: `type は ${VALID_TYPES.join(" / ")} のいずれかです`,
        meta: {},
      },
      { status: 400 }
    );
  }
  if (!body.content?.trim()) {
    return Response.json(
      { success: false, data: null, message: "content は必須です", meta: {} },
      { status: 400 }
    );
  }

  // 候補者の存在確認
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id, name")
    .eq("id", body.candidate_id)
    .eq("is_deleted", false)
    .single();

  if (candidateError || !candidate) {
    return Response.json(
      { success: false, data: null, message: "候補者が見つかりません", meta: {} },
      { status: 404 }
    );
  }

  // テンプレート指定時は存在確認
  if (body.template_id) {
    const { error: templateError } = await supabase
      .from("message_templates")
      .select("id")
      .eq("id", body.template_id)
      .single();

    if (templateError) {
      return Response.json(
        { success: false, data: null, message: "テンプレートが見つかりません", meta: {} },
        { status: 404 }
      );
    }
  }

  // NOTE: 実際のLINE/SMS/メール送信はここで外部API連携を追加する
  // 現時点では送信記録の保存のみ実装
  const now = new Date().toISOString();

  const insertData: FollowLogInsert = {
    candidate_id: body.candidate_id,
    template_id:  body.template_id ?? null,
    type:         body.type,
    content:      body.content.trim(),
    status:       "sent",
    sent_at:      now,
  };

  const { data, error } = await supabase
    .from("follow_logs")
    .insert(insertData)
    .select(`
      *,
      candidate:candidates!follow_logs_candidate_id_fkey(id, name, phone, email),
      template:message_templates!follow_logs_template_id_fkey(id, name, type)
    `)
    .single();

  if (error) {
    return Response.json(
      { success: false, data: null, message: error.message, meta: {} },
      { status: 500 }
    );
  }

  await recordLog("create", `フォロー送信: ${body.type} → ${candidate.name}`);

  return Response.json(
    { success: true, data, message: "フォローを送信しました", meta: {} },
    { status: 201 }
  );
}
