import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("applications")
    .select(
      `*,
      candidate:candidates(id, name),
      job:jobs(id, title, company:companies(id, name))`
    )
    .eq("id", id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  // ステータス変更があれば履歴を自動記録
  if (body.status) {
    const { data: current } = await supabase
      .from("applications")
      .select("status")
      .eq("id", id)
      .single();

    if (current && current.status !== body.status) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("application_status_histories").insert({
        application_id: id,
        from_status: current.status,
        to_status: body.status,
        changed_by: user?.id ?? null,
        changed_at: new Date().toISOString(),
      });
    }
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(
      `*,
      candidate:candidates(id, name),
      job:jobs(id, title, company:companies(id, name))`
    )
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
