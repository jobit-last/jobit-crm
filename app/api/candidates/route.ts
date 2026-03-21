import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const name = searchParams.get("name");
  const status = searchParams.get("status");
  const ca_id = searchParams.get("ca_id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("candidates")
    .select("*, ca:profiles!candidates_ca_id_fkey(id, full_name)", { count: "exact" })
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (name) query = query.ilike("name", `%${name}%`);
  if (status) query = query.eq("status", status);
  if (ca_id) query = query.eq("ca_id", ca_id);

  const { data, error, count } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, count, page, limit });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("candidates")
    .insert({ ...body, is_deleted: false })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await recordLog("create", `求職者作成: ${data.name ?? data.id}`);
  return Response.json({ data }, { status: 201 });
}
