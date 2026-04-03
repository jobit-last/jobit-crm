import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";
import { NextRequest } from "next/server";

// PUT /api/portal-users/[id] - ポータルユーザー更新（有効/無効切替・ID再発行）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  // アクション分岐
  if (body.action === "toggle_active") {
    const { data: current } = await supabase
      .from("candidates")
      .select("portal_active, name")
      .eq("id", id)
      .single();

    if (!current) return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 });

    const newActive = !current.portal_active;
    const { error } = await supabase
      .from("candidates")
      .update({ portal_active: newActive })
      .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    await recordLog(
      "update",
      `ポータルアカウント${newActive ? "有効化" : "無効化"}: ${current.name}`
    );

    return Response.json({ success: true, portal_active: newActive });
  }

  if (body.action === "reissue_id") {
    // 新しいPT-XXXX IDを生成
    const { data: maxRow } = await supabase
      .from("candidates")
      .select("portal_login_id")
      .not("portal_login_id", "is", null)
      .order("portal_login_id", { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (maxRow && maxRow.length > 0 && maxRow[0].portal_login_id) {
      const match = maxRow[0].portal_login_id.match(/PT-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const newLoginId = `PT-${String(nextNum).padStart(4, "0")}`;

    // candidates テーブル更新
    const { data: candidate, error: fetchErr } = await supabase
      .from("candidates")
      .select("email, name")
      .eq("id", id)
      .single();

    if (fetchErr || !candidate) {
      return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    const { error: updateErr } = await supabase
      .from("candidates")
      .update({ portal_login_id: newLoginId, portal_active: true })
      .eq("id", id);

    if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 });

    // Supabase Auth パスワードも更新
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceKey && candidate.email) {
      // メールアドレスでAuthユーザーを検索
      const listRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`,
        {
          method: "GET",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      );

      // Auth ユーザーの検索はメールで直接フィルタできないので、
      // パスワード更新は簡易的にemailでユーザーを特定
      // NOTE: 本番ではより堅牢な方法を検討
      try {
        const usersRes = await fetch(
          `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=50`,
          {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          }
        );
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const authUser = usersData.users?.find(
            (u: { email: string }) => u.email === candidate.email
          );
          if (authUser) {
            await fetch(`${supabaseUrl}/auth/v1/admin/users/${authUser.id}`, {
              method: "PUT",
              headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ password: newLoginId }),
            });
          }
        }
      } catch {
        // Auth更新失敗は無視（DBは更新済み）
      }
    }

    await recordLog("update", `ポータルID再発行: ${candidate.name} → ${newLoginId}`);

    return Response.json({ success: true, portal_login_id: newLoginId });
  }

  return Response.json({ error: "不明なアクションです" }, { status: 400 });
}
