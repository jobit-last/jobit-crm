import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("notifications")
    .select("*, candidate:candidates(id, name)")
    .eq("id", id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("notifications")
    .update(body)
    .eq("id", id)
    .select("*, candidate:candidates(id, name)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("notifications").delete().eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
