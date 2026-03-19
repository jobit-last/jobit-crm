import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("schedules")
    .select("*, candidate:candidates(id, name)")
    .order("scheduled_at", { ascending: true });

  if (from) query = query.gte("scheduled_at", from);
  if (to) query = query.lt("scheduled_at", to);

  const { data, error } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  if (!body.title || !body.scheduled_at || !body.type) {
    return Response.json({ error: "タイトル・日時・種別は必須です" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("schedules")
    .insert({ ...body, user_id: user?.id ?? null })
    .select("*, candidate:candidates(id, name)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
