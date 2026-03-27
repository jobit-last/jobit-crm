import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import type { ResumeContent } from "@/types/resume";

const client = new Anthropic();

function buildPrompt(candidate: Record<string, unknown>): string {
  const lines: string[] = [
    "あなたは日本の転職市場を熟知したプロのキャリアアドバイザーです。",
    "以下の求職者情報をもとに、転職活動で使用する履歴書のコンテンツを生成してください。",
    "",
    "## 求職者情報",
    `氏名: ${candidate.name ?? "不明"}`,
    `メール: ${candidate.email ?? "不明"}`,
    `電話番号: ${candidate.phone ?? "不明"}`,
    `生年月日: ${candidate.birth_date ?? "不明"}`,
    `性別: ${candidate.gender ?? "不明"}`,
    `現在の会社: ${candidate.current_company ?? "不明"}`,
    `現在の年収: ${candidate.current_salary ? `${candidate.current_salary}万円` : "不明"}`,
    `希望年収: ${candidate.desired_salary ? `${candidate.desired_salary}万円` : "不明"}`,
    "",
    "## 出力フォーマット（必ずこのJSON形式で回答すること）",
    "```json",
    "{",
    '  "summary": "自己PR（200〜400文字。強みや経験を活かしたアピール文）",',
    '  "work_history": "職務経歴（箇条書きで具体的な業務内容と成果を記載）",',
    '  "skills": "スキル・技術（業務で使用した技術やツール、語学力など）",',
    '  "education": "学歴（最終学歴を中心に記載）",',
    '  "certifications": "資格（保有資格があれば記載、なければ空文字）"',
    "}",
    "```",
    "",
    "以下のルールを厳守してください：",
    "- 各フィールドの文章は改行（\\n）を使って見やすく整形してください",
    "- work_historyは「■ 会社名」のようにセクション分けしてください",
    "- 求職者情報が少ない場合は一般的な内容で埋めてください",
    "- JSONブロック以外の文字は出力しないでください",
  ];
  return lines.join("\n");
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 求職者情報を取得
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .single();

    if (candidateError || !candidate) {
      return Response.json({ error: "求職者が見つかりません" }, { status: 404 });
    }

    const prompt = buildPrompt(candidate);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "AIからの応答がありません" }, { status: 500 });
    }

    const raw = textBlock.text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const content: ResumeContent = JSON.parse(raw);

    return Response.json({ content });
  } catch (err) {
    console.error("[resume/generate] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
