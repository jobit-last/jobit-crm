import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const userName = searchParams.get("user_name") || "";
  const action = searchParams.get("action") || "";
  const dateFrom = searchParams.get("date_from") || "";
  const dateTo = searchParams.get("date_to") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 30;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("activity_logs")
    .select("*, user:users!activity_logs_user_id_fkey(name, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (action) query = query.eq("action", action);
  if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00`);
  if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Join結果を整形 & ユーザー名フィルタ
  let logs = (data || []).map((row: Record<string, unknown>) => {
    const u = row.user as { name: string; email: string } | null;
    return {
      id: row.id,
      user_id: row.user_id,
      action: row.action,
      target: row.target,
      ip_address: row.ip_address,
      created_at: row.created_at,
      user_name: u?.name ?? "不明",
      user_email: u?.email ?? "",
    };
  });

  if (userName) {
    const kw = userName.toLowerCase();
    logs = logs.filter(
      (l) => l.user_name.toLowerCase().includes(kw) || l.user_email.toLowerCase().includes(kw)
    );
  }

  return Response.json({ data: logs, count, page, limit });
}
