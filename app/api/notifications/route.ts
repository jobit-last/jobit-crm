import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidate_id");
  const type = searchParams.get("type");

  let query = supabase
    .from("notifications")
    .select("*, candidate:candidates(id, name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (candidateId) query = query.eq("candidate_id", candidateId);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  if (!body.type || !body.content) {
    return Response.json({ error: "種別と内容は必須です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      candidate_id: body.candidate_id ?? null,
      type: body.type,
      content: body.content,
      status: body.status ?? "sent",
      sent_at: body.sent_at ?? new Date().toISOString(),
    })
    .select("*, candidate:candidates(id, name)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
