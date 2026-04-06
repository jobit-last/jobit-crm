import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/ai/chat
 * AIチャットボット - Jobit CRM全データベースから情報を抽出・回答
 */

/** ユーザーの質問からどのテーブルを参照すべきか判定するキーワードマップ */
const TABLE_KEYWORDS: Record<string, string[]> = {
  candidates: ["求職者", "候補者", "応募者", "人材", "転職者", "登録者", "PT-"],
  companies: ["企業", "会社", "クライアント", "取引先", "法人"],
  jobs: ["求人", "ポジション", "職種", "募集", "案件"],
  applications: ["選考", "応募", "エントリー", "書類選考", "面接結果"],
  interviews: ["面接", "面談", "インタビュー"],
  resumes: ["履歴書", "職務経歴書", "レジュメ"],
  candidate_memos: ["メモ", "連絡履歴", "ノート"],
  candidate_status_histories: ["ステータス変更", "状態遷移", "進捗"],
  contracts: ["契約", "契約書"],
  memorandums: ["覚書"],
  invoices: ["請求書", "請求", "インボイス"],
  sales: ["売上", "収益", "成約", "売り上げ"],
  schedules: ["スケジュール", "予定", "カレンダー"],
  notifications: ["通知", "お知らせ", "アラート"],
  knowledge: ["ナレッジ", "知識", "ノウハウ", "マニュアル"],
  users: ["ユーザー", "アドバイザー", "CA", "担当者", "スタッフ"],
  activity_logs: ["操作ログ", "ログ", "アクティビティ", "操作履歴"],
  follow_logs: ["フォロー", "追跡"],
  diagnosis_hearings: ["診断", "ヒアリング", "市場価値"],
  message_templates: ["テンプレート", "メッセージ雛形"],
};

/** 質問文からどのテーブルが関連するか判定 */
function detectRelevantTables(question: string): string[] {
  const found: string[] = [];
  for (const [table, keywords] of Object.entries(TABLE_KEYWORDS)) {
    if (keywords.some((kw) => question.includes(kw))) {
      found.push(table);
    }
  }
  // 何もヒットしない場合はダッシュボード系のデータを返す
  if (found.length === 0) {
    return ["candidates", "companies", "jobs", "applications", "sales"];
  }
  return found;
}

/** 各テーブルからコンテキストデータを取得 */
async function fetchTableContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  question: string
): Promise<string> {
  try {
    switch (table) {
      case "candidates": {
        // PT-XXXX IDで検索する場合
        const ptMatch = question.match(/PT-\d+/i);
        if (ptMatch) {
          const { data } = await supabase
            .from("candidates")
            .select("*, ca:users!candidates_ca_id_fkey(id, name)")
            .ilike("portal_login_id", ptMatch[0])
            .eq("is_deleted", false)
            .limit(5);
          if (data && data.length > 0) {
            return `【求職者検索結果 (${ptMatch[0]})】\n${data.map((c: Record<string, unknown>) =>
              `ID: ${c.portal_login_id}, 名前: ${c.name}, ステータス: ${c.status}, メール: ${c.email || "N/A"}, 電話: ${c.phone || "N/A"}, 現職: ${c.current_company || "N/A"}, 現年収: ${c.current_salary ? `${c.current_salary}万円` : "N/A"}, 希望年収: ${c.desired_salary ? `${c.desired_salary}万円` : "N/A"}, 担当CA: ${(c.ca as { name?: string } | null)?.name || "未割当"}`
            ).join("\n")}`;
          }
        }

        // 統計情報
        const { data: stats } = await supabase
          .from("candidates")
          .select("status, portal_login_id")
          .eq("is_deleted", false);

        const statusCount: Record<string, number> = {};
        (stats || []).forEach((c: Record<string, unknown>) => {
          const s = c.status as string;
          statusCount[s] = (statusCount[s] || 0) + 1;
        });

        const statusLabels: Record<string, string> = {
          new: "新規登録", interview_scheduling: "面談調整中", interviewed: "面談済み",
          job_proposed: "求人提案中", applying: "応募中", in_selection: "選考中",
          offered: "内定", placed: "入社", failed: "不合格", closed: "対応終了",
        };

        // 直近登録5名
        const { data: recent } = await supabase
          .from("candidates")
          .select("name, portal_login_id, status, created_at, ca:users!candidates_ca_id_fkey(name)")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(5);

        return `【求職者統計】\n総数: ${(stats || []).length}名\n${Object.entries(statusCount).map(([s, n]) => `${statusLabels[s] || s}: ${n}名`).join(", ")}\n\n【直近登録求職者】\n${(recent || []).map((c: Record<string, unknown>) =>
          `${c.portal_login_id || "ID未付与"} ${c.name} (${statusLabels[c.status as string] || c.status}) 登録: ${new Date(c.created_at as string).toLocaleDateString("ja-JP")} 担当: ${(c.ca as { name?: string } | null)?.name || "未割当"}`
        ).join("\n")}`;
      }

      case "companies": {
        const { data: companies } = await supabase
          .from("companies")
          .select("id, name, industry, location, contact_name")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(10);

        const { count } = await supabase
          .from("companies")
          .select("id", { count: "exact" })
          .eq("is_deleted", false);

        return `【企業情報】\n総企業数: ${count ?? 0}社\n\n直近企業:\n${(companies || []).map((c: Record<string, unknown>) =>
          `${c.name} (業界: ${c.industry || "N/A"}, 所在地: ${c.location || "N/A"}, 担当: ${c.contact_name || "N/A"})`
        ).join("\n")}`;
      }

      case "jobs": {
        const { data: jobs } = await supabase
          .from("jobs")
          .select("id, title, status, location, salary_min, salary_max, company:companies(name)")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(10);

        const { count: openCount } = await supabase
          .from("jobs")
          .select("id", { count: "exact" })
          .eq("status", "open")
          .eq("is_deleted", false);

        return `【求人情報】\n公開中求人数: ${openCount ?? 0}件\n\n直近求人:\n${(jobs || []).map((j: Record<string, unknown>) =>
          `${j.title} @ ${(j.company as { name?: string } | null)?.name || "N/A"} (${j.status}, ${j.location || "N/A"}, ${j.salary_min || "?"}〜${j.salary_max || "?"}万円)`
        ).join("\n")}`;
      }

      case "applications": {
        const { data: apps } = await supabase
          .from("applications")
          .select("id, status, created_at, candidate:candidates(name, portal_login_id), job:jobs(title, company:companies(name))")
          .order("created_at", { ascending: false })
          .limit(10);

        const { count } = await supabase
          .from("applications")
          .select("id", { count: "exact" });

        return `【選考情報】\n総選考数: ${count ?? 0}件\n\n直近選考:\n${(apps || []).map((a: Record<string, unknown>) => {
          const cand = a.candidate as { name?: string; portal_login_id?: string } | null;
          const job = a.job as { title?: string; company?: { name?: string } } | null;
          return `${cand?.portal_login_id || "?"} ${cand?.name || "N/A"} → ${job?.title || "N/A"} @ ${job?.company?.name || "N/A"} (${a.status}) ${new Date(a.created_at as string).toLocaleDateString("ja-JP")}`;
        }).join("\n")}`;
      }

      case "interviews": {
        const { data: interviews } = await supabase
          .from("interviews")
          .select("id, interview_date, interview_type, status, application:applications(candidate:candidates(name, portal_login_id), job:jobs(title))")
          .order("interview_date", { ascending: false })
          .limit(10);

        return `【面接情報】\n直近面接:\n${(interviews || []).map((i: Record<string, unknown>) => {
          const app = i.application as { candidate?: { name?: string; portal_login_id?: string }; job?: { title?: string } } | null;
          return `${app?.candidate?.portal_login_id || "?"} ${app?.candidate?.name || "N/A"} - ${app?.job?.title || "N/A"} (${i.interview_type || "N/A"}, ${i.status}) ${i.interview_date ? new Date(i.interview_date as string).toLocaleDateString("ja-JP") : "日程未定"}`;
        }).join("\n")}`;
      }

      case "contracts": {
        const { data: contracts } = await supabase
          .from("contracts")
          .select("id, contract_type, status, start_date, end_date, company:companies(name)")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【契約情報】\n直近契約:\n${(contracts || []).map((c: Record<string, unknown>) =>
          `${(c.company as { name?: string } | null)?.name || "N/A"} (${c.contract_type || "N/A"}, ${c.status}) ${c.start_date || "?"} 〜 ${c.end_date || "?"}`
        ).join("\n")}`;
      }

      case "invoices": {
        const { data: invoices } = await supabase
          .from("invoices")
          .select("id, invoice_number, amount, status, due_date, company:companies(name)")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【請求書情報】\n直近請求書:\n${(invoices || []).map((inv: Record<string, unknown>) =>
          `${inv.invoice_number || "N/A"} ${(inv.company as { name?: string } | null)?.name || "N/A"} ¥${((inv.amount as number) || 0).toLocaleString()} (${inv.status}) 期限: ${inv.due_date || "N/A"}`
        ).join("\n")}`;
      }

      case "sales": {
        const { data: sales } = await supabase
          .from("sales")
          .select("id, amount, sale_date, status, candidate:candidates(name, portal_login_id), company:companies(name)")
          .order("sale_date", { ascending: false })
          .limit(10);

        const totalAmount = (sales || []).reduce((sum: number, s: Record<string, unknown>) => sum + ((s.amount as number) || 0), 0);

        return `【売上情報】\n直近売上合計: ¥${totalAmount.toLocaleString()}\n\n直近売上:\n${(sales || []).map((s: Record<string, unknown>) => {
          const cand = s.candidate as { name?: string; portal_login_id?: string } | null;
          return `${cand?.portal_login_id || "?"} ${cand?.name || "N/A"} → ${(s.company as { name?: string } | null)?.name || "N/A"} ¥${((s.amount as number) || 0).toLocaleString()} (${s.status}) ${s.sale_date || "N/A"}`;
        }).join("\n")}`;
      }

      case "schedules": {
        const today = new Date().toISOString().split("T")[0];
        const { data: schedules } = await supabase
          .from("schedules")
          .select("id, title, start_time, end_time, user:users(name)")
          .gte("start_time", today)
          .order("start_time", { ascending: true })
          .limit(10);

        return `【スケジュール】\n今日以降の予定:\n${(schedules || []).map((s: Record<string, unknown>) =>
          `${s.title || "N/A"} (${(s.user as { name?: string } | null)?.name || "N/A"}) ${s.start_time ? new Date(s.start_time as string).toLocaleString("ja-JP") : "N/A"}`
        ).join("\n")}`;
      }

      case "notifications": {
        const { data: notifs } = await supabase
          .from("notifications")
          .select("id, title, message, is_read, created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        const unreadCount = (notifs || []).filter((n: Record<string, unknown>) => !n.is_read).length;

        return `【通知】\n未読: ${unreadCount}件\n\n直近通知:\n${(notifs || []).map((n: Record<string, unknown>) =>
          `${n.is_read ? "✓" : "●"} ${n.title || "N/A"}: ${n.message || ""} (${new Date(n.created_at as string).toLocaleDateString("ja-JP")})`
        ).join("\n")}`;
      }

      case "knowledge": {
        const { data: articles } = await supabase
          .from("knowledge")
          .select("id, title, category, created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【ナレッジ】\n直近記事:\n${(articles || []).map((a: Record<string, unknown>) =>
          `${a.title || "N/A"} (${a.category || "未分類"}) ${new Date(a.created_at as string).toLocaleDateString("ja-JP")}`
        ).join("\n")}`;
      }

      case "users": {
        const { data: users } = await supabase
          .from("users")
          .select("id, name, email, role")
          .order("created_at", { ascending: false });

        return `【ユーザー（スタッフ）】\n総数: ${(users || []).length}名\n${(users || []).map((u: Record<string, unknown>) =>
          `${u.name || "N/A"} (${u.role || "N/A"}) ${u.email || "N/A"}`
        ).join("\n")}`;
      }

      case "candidate_memos": {
        const { data: memos } = await supabase
          .from("candidate_memos")
          .select("id, content, created_at, candidate:candidates(name, portal_login_id), author:users!user_id(name)")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【求職者メモ】\n直近メモ:\n${(memos || []).map((m: Record<string, unknown>) => {
          const cand = m.candidate as { name?: string; portal_login_id?: string } | null;
          return `${cand?.portal_login_id || "?"} ${cand?.name || "N/A"}: ${((m.content as string) || "").substring(0, 100)} (${(m.author as { name?: string } | null)?.name || "N/A"}, ${new Date(m.created_at as string).toLocaleDateString("ja-JP")})`;
        }).join("\n")}`;
      }

      case "candidate_status_histories": {
        const { data: histories } = await supabase
          .from("candidate_status_histories")
          .select("id, old_status, new_status, changed_at, candidate:candidates!candidate_id(name, portal_login_id), changer:users!changed_by(name)")
          .order("changed_at", { ascending: false })
          .limit(10);

        return `【ステータス変更履歴】\n直近変更:\n${(histories || []).map((h: Record<string, unknown>) => {
          const cand = h.candidate as { name?: string; portal_login_id?: string } | null;
          return `${cand?.portal_login_id || "?"} ${cand?.name || "N/A"}: ${h.old_status} → ${h.new_status} (${(h.changer as { name?: string } | null)?.name || "N/A"}, ${new Date(h.changed_at as string).toLocaleDateString("ja-JP")})`;
        }).join("\n")}`;
      }

      case "activity_logs": {
        const { data: logs } = await supabase
          .from("activity_logs")
          .select("id, action, description, created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【操作ログ】\n直近ログ:\n${(logs || []).map((l: Record<string, unknown>) =>
          `${l.action || "N/A"}: ${l.description || "N/A"} (${new Date(l.created_at as string).toLocaleDateString("ja-JP")})`
        ).join("\n")}`;
      }

      case "memorandums": {
        const { data: memos } = await supabase
          .from("memorandums")
          .select("id, title, status, company:companies(name)")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【覚書】\n直近覚書:\n${(memos || []).map((m: Record<string, unknown>) =>
          `${m.title || "N/A"} (${(m.company as { name?: string } | null)?.name || "N/A"}, ${m.status || "N/A"})`
        ).join("\n")}`;
      }

      case "resumes": {
        const { data: resumes } = await supabase
          .from("resumes")
          .select("id, file_name, created_at, candidate:candidates(name, portal_login_id)")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【履歴書】\n直近アップロード:\n${(resumes || []).map((r: Record<string, unknown>) => {
          const cand = r.candidate as { name?: string; portal_login_id?: string } | null;
          return `${cand?.portal_login_id || "?"} ${cand?.name || "N/A"}: ${r.file_name || "N/A"} (${new Date(r.created_at as string).toLocaleDateString("ja-JP")})`;
        }).join("\n")}`;
      }

      case "follow_logs": {
        const { data: follows } = await supabase
          .from("follow_logs")
          .select("id, action, note, created_at, candidate:candidates(name, portal_login_id)")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【フォローログ】\n直近フォロー:\n${(follows || []).map((f: Record<string, unknown>) => {
          const cand = f.candidate as { name?: string; portal_login_id?: string } | null;
          return `${cand?.portal_login_id || "?"} ${cand?.name || "N/A"}: ${f.action || "N/A"} ${((f.note as string) || "").substring(0, 80)} (${new Date(f.created_at as string).toLocaleDateString("ja-JP")})`;
        }).join("\n")}`;
      }

      case "diagnosis_hearings": {
        const { data: diags } = await supabase
          .from("diagnosis_hearings")
          .select("id, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        return `【市場価値診断】\n直近診断: ${(diags || []).length}件`;
      }

      case "message_templates": {
        const { data: templates } = await supabase
          .from("message_templates")
          .select("id, title, category")
          .order("created_at", { ascending: false })
          .limit(10);

        return `【メッセージテンプレート】\n${(templates || []).map((t: Record<string, unknown>) =>
          `${t.title || "N/A"} (${t.category || "未分類"})`
        ).join("\n")}`;
      }

      default:
        return "";
    }
  } catch (err) {
    console.error(`[ai-chat] Error fetching ${table}:`, err);
    return `【${table}】データ取得エラー`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { messages } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, data: null, message: "メッセージは必須です" },
        { status: 400 }
      );
    }

    // 最新のユーザーメッセージからテーブルを判定
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const question = lastUserMsg?.content || "";
    const relevantTables = detectRelevantTables(question);

    // 関連テーブルからデータを並行取得
    const contextParts = await Promise.all(
      relevantTables.map((table) => fetchTableContext(supabase, table, question))
    );

    const crmDataContext = contextParts.filter(Boolean).join("\n\n");

    // Claude API call
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, data: null, message: "APIキーが設定されていません" },
        { status: 500 }
      );
    }

    const systemPrompt = `あなたはJobit CRMの「AIチャットボット」です。人材紹介会社のキャリアアドバイザー（CA）をサポートする高度なAIアシスタントです。

【役割】
- Jobit CRM内の全データベースから情報を検索・分析・回答
- 求職者管理、企業管理、求人管理、選考管理、売上管理、契約管理、スケジュール管理、ナレッジ管理など全機能をサポート
- 経営分析やKPIの可視化をサポート
- キャリアアドバイザーの業務効率化を提案

【利用可能なCRMデータ】
${crmDataContext || "（該当するデータがありません）"}

【重要な指示】
- 上記のCRMデータに基づいて正確に回答してください
- データにない情報は推測せず「該当する情報がCRMデータ内にありません」と答えてください
- 日本語で丁寧かつ正確に回答してください
- 個人情報は慎重に扱い、Jobit CRM内部でのみ使用される前提で回答してください
- 外部への情報漏洩を防ぐため、データのエクスポートや外部共有を促す回答は避けてください
- 求職者はPT-XXXX形式のIDで管理されています。IDで質問された場合は対応する求職者情報を参照してください
- 実用的で具体的なアドバイスを提供してください`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", errText);
      return NextResponse.json(
        { success: false, data: null, message: "AIチャットボットでエラーが発生しました" },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const reply = claudeData.content?.[0]?.text || "回答を生成できませんでした。";

    return NextResponse.json({
      success: true,
      data: {
        reply,
        tables_queried: relevantTables,
      },
      message: "",
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
