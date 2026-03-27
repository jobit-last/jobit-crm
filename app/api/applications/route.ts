import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const status = searchParams.get("status");
  const candidate_id = searchParams.get("candidate_id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("applications")
    .select(
      `*,
      candidate:candidates(id, name),
      job:jobs(id, title, company:companies(id, name))`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (candidate_id) query = query.eq("candidate_id", candidate_id);

  const { data, error, count } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, count, page, limit });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("applications")
    .insert(body)
    .select(
      `*,
      candidate:candidates(id, name),
      job:jobs(id, title, company:companies(id, name))`
    )
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // 初期ステータス履歴を自動記録
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("application_status_histories").insert({
    application_id: data.id,
    from_status: null,
    to_status: data.status,
    changed_by: user?.id ?? null,
    changed_at: new Date().toISOString(),
  });

  return Response.json({ data }, { status: 201 });
}
