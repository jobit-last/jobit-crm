import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("invoices")
    .select("*, company:companies(id, name), candidate:candidates(id, name)")
    .order("invoice_date", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  if (!body.amount || !body.invoice_date || !body.due_date) {
    return Response.json(
      { error: "金額・請求日・支払期限は必須です" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert(body)
    .select("*, company:companies(id, name), candidate:candidates(id, name)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
