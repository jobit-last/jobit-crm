import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import type { DiagnosisHearing } from "@/types/diagnosis";

const client = new Anthropic();

export interface DiagnosisResult {
  score: number; // 0–100
  salary_min: number; // 万円
  salary_max: number; // 万円
  strengths: string[];
  gaps: string[];
  recommended_jobs: { title: string; reason: string }[];
  career_advice: string;
}

function buildPrompt(h: DiagnosisHearing): string {
  const lines: string[] = [
    "あなたは日本の転職市場を熟知したキャリアアドバイザーです。",
    "以下の求職者のヒアリング情報をもとに、市場価値診断を行い、指定のJSONフォーマットで回答してください。",
    "",
    "## 求職者情報",
    `氏名: ${h.name}`,
    `年齢: ${h.age ?? "不明"}歳`,
    `最終学歴: ${h.education ?? "不明"}`,
    `現在の会社: ${h.company ?? "不明"}`,
    `業界: ${h.industry ?? "不明"}`,
    `職種: ${h.occupation ?? "不明"}`,
    `現在の年収: ${h.current_salary ?? "不明"}万円`,
    `在籍年数: ${h.tenure_years ?? "不明"}年`,
    `保有資格: ${h.certifications?.join(", ") || "なし"}`,
    `強み・スキル: ${h.strengths ?? "不明"}`,
    `使用ツール・技術: ${h.tools ?? "不明"}`,
    `職務内容: ${h.work_history ?? "不明"}`,
    `実績・成果: ${h.achievements ?? "不明"}`,
    `マネジメント経験: ${h.has_management ? "あり" : "なし"}`,
    h.has_management ? `マネジメント詳細: ${h.management_detail ?? "不明"}` : "",
    `希望職種: ${h.desired_occupation ?? "不明"}`,
    `希望年収: ${h.desired_salary ?? "不明"}万円`,
    `希望勤務地: ${h.desired_location ?? "不明"}`,
    `転職希望時期: ${h.desired_timing ?? "不明"}`,
    "",
    "## 出力フォーマット（必ずこのJSON形式で回答すること）",
    "```json",
    "{",
    '  "score": <市場価値スコア 0〜100の整数>,',
    '  "salary_min": <想定年収下限 万円単位の整数>,',
    '  "salary_max": <想定年収上限 万円単位の整数>,',
    '  "strengths": ["強み1", "強み2", "強み3", ...],',
    '  "gaps": ["不足スキル1", "不足スキル2", ...],',
    '  "recommended_jobs": [',
    '    {"title": "職種名1", "reason": "推薦理由1"},',
    '    {"title": "職種名2", "reason": "推薦理由2"},',
    '    {"title": "職種名3", "reason": "推薦理由3"}',
    "  ],",
    '  "career_advice": "キャリアアドバイス（200〜400文字程度）"',
    "}",
    "```",
    "",
    "スコアは現在の日本の転職市場における客観的な市場価値を反映してください。",
    "JSONブロック以外の文字は出力しないでください。",
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const hearing: DiagnosisHearing = await request.json();

    if (!hearing?.name) {
      return Response.json({ error: "hearing data is required" }, { status: 400 });
    }

    const prompt = buildPrompt(hearing);

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    // Extract the text block from the response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "No text response from Claude" }, { status: 500 });
    }

    // Parse JSON from the response (strip markdown code fences if present)
    const raw = textBlock.text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result: DiagnosisResult = JSON.parse(raw);

    return Response.json({ result });
  } catch (err) {
    console.error("[analyze] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
