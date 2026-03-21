import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "認証されていません" }, { status: 401 });
  }

  // メールアドレスで求職者を特定
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*, ca:profiles!candidates_ca_id_fkey(id, full_name)")
    .eq("email", user.email)
    .eq("is_deleted", false)
    .single();

  if (error || !candidate) {
    return Response.json(
      { error: "求職者情報が見つかりません" },
      { status: 404 }
    );
  }

  return Response.json({ data: candidate });
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "認証されていません" }, { status: 401 });
  }

  const body = await request.json();

  // 編集可能なフィールドのみ許可
  const allowedFields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.phone !== undefined) allowedFields.phone = body.phone || null;
  if (body.desired_salary !== undefined)
    allowedFields.desired_salary = body.desired_salary
      ? parseInt(body.desired_salary)
      : null;

  const { data, error } = await supabase
    .from("candidates")
    .update(allowedFields)
    .eq("email", user.email)
    .eq("is_deleted", false)
    .select("*, ca:profiles!candidates_ca_id_fkey(id, full_name)")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
