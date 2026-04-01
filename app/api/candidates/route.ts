import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";

function generatePassword(length = 10): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  // 最低1文字ずつ含める
  const required = [pick(upper), pick(lower), pick(digits)];
  const rest = Array.from({ length: length - 3 }, () => pick(all));
  // シャッフル
  const arr = [...required, ...rest];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  // 1. candidates テーブルに登録
  const { data, error } = await supabase
    .from("candidates")
    .insert({ ...body, is_deleted: false })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // 2. メールアドレスがあればポータル用 Auth アカウントを作成
  let portalAccount: { email: string; password: string } | null = null;

  if (body.email) {
    const password = generatePassword(10);

    // Supabase Auth REST API を直接呼び出し（サーバーサイドなのでセッション影響なし）
    const signUpRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`,
      {
        method: "POST",
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: body.email, password }),
      }
    );

    const signUpData = await signUpRes.json();

    if (signUpRes.ok && signUpData.user?.id) {
      portalAccount = { email: body.email, password };
    }
    // 既にAuthアカウントが存在する場合はスキップ（エラーにしない）
  }

  await recordLog("create", `求職者作成: ${data.name ?? data.id}`);
  return Response.json({ data, portalAccount }, { status: 201 });
}
