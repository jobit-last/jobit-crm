import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("application_id", id)
    .order("scheduled_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  if (!body.scheduled_at || !body.interview_type) {
    return Response.json({ error: "日時と面接種別は必須です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("interviews")
    .insert({ ...body, application_id: id })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
