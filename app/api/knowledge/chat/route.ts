import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/knowledge/chat
 * AI チャットボット検索 — ナレッジDBをClaude APIで意味検索
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { message } = await request.json();

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { success: false, data: null, message: "メッセージは必須です" },
        { status: 400 }
      );
    }

    // ナレッジDBから全レコード取得（検索対象）
    const { data: knowledgeData, error: knowledgeError } = await supabase
      .from("knowledge")
      .select("id, title, content, category, tags, selection_result, result_reason, candidate:candidates(id, name), company:companies(id, name)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (knowledgeError) {
      return NextResponse.json(
        { success: false, data: null, message: knowledgeError.message },
        { status: 500 }
      );
    }

    const knowledge = knowledgeData || [];

    // ナレッジ情報をコンテキストとして整形
    const knowledgeContext = knowledge
      .map((k: Record<string, unknown>, i: number) => {
        const candidate = k.candidate as { name?: string } | null;
        const company = k.company as { name?: string } | null;
        const parts = [
          `[${i + 1}] タイトル: ${k.title}`,
          k.category ? `カテゴリ: ${k.category}` : null,
          (k.tags as string[])?.length ? `タグ: ${(k.tags as string[]).join(", ")}` : null,
          candidate?.name ? `求職者: ${candidate.name}` : null,
          company?.name ? `企業: ${company.name}` : null,
          k.selection_result ? `選考結果: ${k.selection_result}` : null,
          k.result_reason ? `理由: ${k.result_reason}` : null,
          k.content ? `内容: ${(k.content as string).slice(0, 500)}` : null,
        ];
        return parts.filter(Boolean).join("\n");
      })
      .join("\n\n---\n\n");

    // Claude API 呼び出し
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // APIキーがない場合: 簡易キーワード検索にフォールバック
      const query = message.toLowerCase();
      const matched = knowledge.filter((k: Record<string, unknown>) => {
        const title = (k.title as string || "").toLowerCase();
        const content = (k.content as string || "").toLowerCase();
        const tags = (k.tags as string[] || []).join(" ").toLowerCase();
        return title.includes(query) || content.includes(query) || tags.includes(query);
      });

      return NextResponse.json({
        success: true,
        data: {
          answer: matched.length > 0
            ? `キーワード「${message}」に一致するナレッジが${matched.length}件見つかりました。\n\n` +
              matched.slice(0, 5).map((k: Record<string, unknown>, i: number) =>
                `${i + 1}. **${k.title}**${k.category ? ` (${k.category})` : ""}\n${(k.content as string || "").slice(0, 200)}...`
              ).join("\n\n")
            : `「${message}」に該当するナレッジは見つかりませんでした。`,
          sources: matched.slice(0, 5).map((k: Record<string, unknown>) => ({
            id: k.id,
            title: k.title,
            category: k.category,
          })),
          mode: "keyword_fallback",
        },
        message: "",
      });
    }

    // Claude API でセマンティック検索
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: `あなたは人材紹介会社のナレッジ検索アシスタントです。
以下のナレッジデータベースの内容を基に、ユーザーの質問に回答してください。
回答はナレッジDBの情報に基づいて行い、データにない情報は推測せず「該当する情報がありません」と答えてください。
関連するナレッジがある場合は、そのタイトルと番号を参照として含めてください。
日本語で回答してください。

【ナレッジデータベース】
${knowledgeContext}`,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", errText);
      return NextResponse.json(
        { success: false, data: null, message: "AI検索でエラーが発生しました" },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const answer =
      claudeData.content?.[0]?.text || "回答を生成できませんでした。";

    // 回答に含まれるナレッジ参照を抽出
    const referencedIds: string[] = [];
    const refPattern = /\[(\d+)\]/g;
    let match;
    while ((match = refPattern.exec(answer)) !== null) {
      const idx = parseInt(match[1]) - 1;
      if (idx >= 0 && idx < knowledge.length) {
        referencedIds.push(knowledge[idx].id as string);
      }
    }

    const sources = referencedIds.map((id) => {
      const k = knowledge.find((item: Record<string, unknown>) => item.id === id);
      return k ? { id: k.id, title: k.title, category: k.category } : null;
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        answer,
        sources,
        mode: "ai",
      },
      message: "",
    });
  } catch (error) {
    console.error("Knowledge chat error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
