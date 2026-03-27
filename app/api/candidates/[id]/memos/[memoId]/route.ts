import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memoId: string }> }
) {
  const supabase = await createClient();
  const { id, memoId } = await params;

  const { error } = await supabase
    .from("candidate_memos")
    .delete()
    .eq("id", memoId)
    .eq("candidate_id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
