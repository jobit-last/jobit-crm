import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// GET /api/portal-users - ポータルユーザー一覧取得
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || ""; // "active" | "inactive" | ""
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("candidates")
    .select("id, name, email, portal_login_id, portal_active, created_at, status", { count: "exact" })
    .not("portal_login_id", "is", null)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,portal_login_id.ilike.%${search}%`);
  }

  if (status === "active") query = query.eq("portal_active", true);
  if (status === "inactive") query = query.eq("portal_active", false);

  const { data, error, count } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, count, page, limit });
}
