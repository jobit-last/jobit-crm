import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("candidates")
    .select("*, ca:profiles!candidates_ca_id_fkey(id, full_name)")
    .eq("id", id)
    .eq("is_deleted", false)
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

  const { data, error } = await supabase
    .from("candidates")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await recordLog("update", `求職者更新: ${data.name ?? id}`);
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase
    .from("candidates")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await recordLog("delete", `求職者削除: ${id}`);
  return new Response(null, { status: 204 });
}
