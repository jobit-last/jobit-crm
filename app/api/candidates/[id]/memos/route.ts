import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("candidate_memos")
    .select("*, author:users!user_id(name)")
    .eq("candidate_id", id)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const { content, memo_type } = await request.json();

  if (!content?.trim()) {
    return Response.json({ error: "内容は必須です" }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("candidate_memos")
    .insert({
      candidate_id: id,
      user_id: user?.id ?? null,
      content: content.trim(),
      memo_type: memo_type ?? "other",
    })
    .select("*, author:users!user_id(name)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
