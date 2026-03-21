import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import type { UserInsert } from "@/types/user";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body: UserInsert = await request.json();

  const { data, error } = await supabase
    .from("users")
    .insert(body)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await recordLog("create", `ユーザー作成: ${body.name} (${body.email})`);
  return Response.json(data, { status: 201 });
}
