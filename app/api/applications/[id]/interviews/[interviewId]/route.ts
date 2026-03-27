import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  const supabase = await createClient();
  const { id, interviewId } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("interviews")
    .update(body)
    .eq("id", interviewId)
    .eq("application_id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  const supabase = await createClient();
  const { id, interviewId } = await params;

  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId)
    .eq("application_id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
