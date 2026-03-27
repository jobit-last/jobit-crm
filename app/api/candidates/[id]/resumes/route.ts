import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("candidate_id", id)
    .order("version", { ascending: false });

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

  // 次のバージョン番号を取得
  const { data: latest } = await supabase
    .from("resumes")
    .select("version")
    .eq("candidate_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latest?.version ?? 0) + 1;

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      candidate_id: id,
      version: nextVersion,
      title: body.title || `履歴書 v${nextVersion}`,
      content: body.content,
      is_ai_generated: body.is_ai_generated ?? false,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
