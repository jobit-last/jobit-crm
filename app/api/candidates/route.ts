import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const name = searchParams.get("name");
  const status = searchParams.get("status");
  const ca_id = searchParams.get("ca_id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("candidates")
    .select("*, ca:users!candidates_ca_id_fkey(id, name)", { count: "exact" })
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (name) query = query.ilike("name", `%${name}%`);
  if (status) query = query.eq("status", status);
  if (ca_id) query = query.eq("ca_id", ca_id);

  const { data, error, count } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, count, page, limit });
}

/** PT-XXXX 形式の連番IDを生成 */
async function generatePortalLoginId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  // 現在の最大番号を取得
  const { data } = await supabase
    .from("candidates")
    .select("portal_login_id")
    .not("portal_login_id", "is", null)
    .order("portal_login_id", { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (data && data.length > 0 && data[0].portal_login_id) {
    const match = data[0].portal_login_id.match(/PT-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }

  return `PT-${String(nextNum).padStart(4, "0")}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { create_portal, ...candidateData } = body;

  let portalLoginId: string | null = null;

  // ポータルアカウント作成が要求された場合
  if (create_portal && candidateData.email) {
    portalLoginId = await generatePortalLoginId(supabase);

    // Supabase Auth でポータルユーザーを作成（初期パスワード = ログインID）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (serviceKey) {
      // Service Role Key がある場合: admin APIでメール確認不要で作成
      const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: candidateData.email,
          password: portalLoginId,
          email_confirm: true,
        }),
      });

      if (!authRes.ok) {
        const authErr = await authRes.json();
        return Response.json(
          { error: `ポータルアカウント作成に失敗しました: ${authErr.msg || authErr.message || JSON.stringify(authErr)}` },
          { status: 500 }
        );
      }
    } else {
      // Service Role Key がない場合: signUp API で作成
      const authRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: candidateData.email,
          password: portalLoginId,
        }),
      });

      if (!authRes.ok) {
        const authErr = await authRes.json();
        return Response.json(
          { error: `ポータルアカウント作成に失敗しました: ${authErr.msg || authErr.message || JSON.stringify(authErr)}` },
          { status: 500 }
        );
      }
    }
  }

  const insertData = {
    ...candidateData,
    is_deleted: false,
    ...(portalLoginId ? { portal_login_id: portalLoginId, portal_active: true } : {}),
  };

  const { data, error } = await supabase
    .from("candidates")
    .insert(insertData)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  await recordLog("create", `求職者作成: ${data.name ?? data.id}`);

  return Response.json(
    { data, portal_login_id: portalLoginId },
    { status: 201 }
  );
}
