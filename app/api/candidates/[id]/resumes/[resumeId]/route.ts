import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; resumeId: string }> }
) {
  const supabase = await createClient();
  const { id, resumeId } = await params;

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("candidate_id", id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resumeId: string }> }
) {
  const supabase = await createClient();
  const { id, resumeId } = await params;
  const body = await request.json();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) update.title = body.title;
  if (body.content !== undefined) update.content = body.content;

  const { data, error } = await supabase
    .from("resumes")
    .update(update)
    .eq("id", resumeId)
    .eq("candidate_id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; resumeId: string }> }
) {
  const supabase = await createClient();
  const { id, resumeId } = await params;

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("candidate_id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
