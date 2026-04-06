import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const client = new Anthropic();

interface JobWithCompany {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  description: string | null;
  required_skills: string | null;
  preferred_skills: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  required_experience_years: number | null;
  status: string;
}

interface CandidateProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  current_company: string | null;
  current_salary: number | null;
  desired_salary: number | null;
  desired_industry: string | null;
  desired_job_type: string | null;
  desired_location: string | null;
  experience_years: number | null;
  [key: string]: unknown;
}

interface MatchResult {
  job_id: string;
  job_title: string;
  company_name: string;
  match_score: number;
  match_reasons: string[];
  concerns: string[];
}

function buildPrompt(candidate: CandidateProfile, jobs: JobWithCompany[]): string {
  const lines: string[] = [
    "あなたは人材マッチングの専門家です。求職者のプロフィールと求人情報を分析し、最適なマッチングを行います。",
    "",
    "## 求職者プロフィール",
    `氏名: ${candidate.name ?? "不明"}`,
    `現在の会社: ${candidate.current_company ?? "不明"}`,
    `現在の年収: ${candidate.current_salary ? `${candidate.current_salary}万円` : "不明"}`,
    `希望年収: ${candidate.desired_salary ? `${candidate.desired_salary}万円` : "不明"}`,
    `希望業界: ${candidate.desired_industry ?? "不明"}`,
    `希望職種: ${candidate.desired_job_type ?? "不明"}`,
    `希望勤務地: ${candidate.desired_location ?? "不明"}`,
    `職歴年数: ${candidate.experience_years ?? "不明"}年`,
    "",
    "## 求人一覧",
  ];

  jobs.forEach((job, index) => {
    lines.push(`### 求人 ${index + 1}`);
    lines.push(`ID: ${job.id}`);
    lines.push(`企業名: ${job.company_name}`);
    lines.push(`職種: ${job.title}`);
    lines.push(`業界: ${job.description ?? "不明"}`);
    lines.push(`勤務地: ${job.location ?? "不明"}`);
    lines.push(`年収: ${job.salary_min ?? "不明"}万円〜${job.salary_max ?? "不明"}万円`);
    lines.push(`必須スキル: ${job.required_skills ?? "不明"}`);
    lines.push(`歓迎スキル: ${job.preferred_skills ?? "不明"}`);
    lines.push(`必須経験年数: ${job.required_experience_years ?? "不明"}年`);
    lines.push("");
  });

  lines.push("## 分析の指示");
  lines.push("求職者のプロフィールと各求人を比較し、以下を日本語で実施してください：");
  lines.push("1. 各求人に対してマッチスコアを0-100で算出");
  lines.push("2. マッチスコアが高い順にソート");
  lines.push("3. マッチ理由を日本語で3〜5個記載");
  lines.push("4. 懵念事項（あれば）を日本語で2〜3個記載");
  lines.push("");
  lines.push("## 出力フォーマット（必ずこのJSON形式で回答すること）");
  lines.push("```json");
  lines.push("{");
  lines.push('  "matches": [');
  lines.push("    {");
  lines.push('      "job_id": "求人ID",');
  lines.push('      "match_score": 85,');
  lines.push('      "match_reasons": ["理由1", "理由2", "理由3"],');
  lines.push('      "concerns": ["懸念1", "懸念2"]');
  lines.push("    }");
  lines.push("  ]");
  lines.push("}");
  lines.push("```");
  lines.push("");
  lines.push("注意:");
  lines.push("- JSONブロック以外の文字は出力しないでください");
  lines.push("- match_reasonsとconcernsは必ず日本語で記載してください");

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
      return Response.json(
        { success: false, error: "求職者が見つかりません" },
        { status: 404 }
      );
    }

    // アクティブな求人を取得
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*, companies(name)")
      .eq("status", "open")
      .eq("is_deleted", false);

    if (jobsError) {
      return Response.json(
        { success: false, error: "求人情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // データを整形
    const jobsWithCompany: JobWithCompany[] = (jobs || []).map(
      (job: Record<string, unknown>) => ({
        id: job.id as string,
        title: job.title as string,
        company_id: job.company_id as string,
        company_name: (job.companies as { name: string } | null)?.name ?? "不明",
        description: job.description as string | null,
        required_skills: job.required_skills as string | null,
        preferred_skills: job.preferred_skills as string | null,
        salary_min: job.salary_min as number | null,
        salary_max: job.salary_max as number | null,
        location: job.location as string | null,
        required_experience_years: job.required_experience_years as number | null,
        status: job.status as string,
      })
    );

    if (jobsWithCompany.length === 0) {
      return Response.json({
        success: true,
        data: {
          candidate_name: candidate.name as string,
          matches: [],
        },
        message: "マッチング対象の求人がありません",
      });
    }

    const prompt = buildPrompt(candidate as CandidateProfile, jobsWithCompany);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      system:
        "あなたは人材マッチングの専門家です。求職者のプロフィールと求人情報を分析し、最適なマッチングを行います。",
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json(
        { success: false, error: "AIからの応答がありません" },
        { status: 500 }
      );
    }

    const raw = textBlock.text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    interface ParsedResponse {
      matches: Array<{
        job_id: string;
        match_score: number;
        match_reasons: string[];
        concerns: string[];
      }>;
    }

    const parsed: ParsedResponse = JSON.parse(raw);

    // ソートしてトップ5を取得
    const sortedMatches = parsed.matches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5);

    // 完全なマッチ情報を構築
    const matches: MatchResult[] = sortedMatches.map((match) => {
      const job = jobsWithCompany.find((j) => j.id === match.job_id);
      return {
        job_id: match.job_id,
        job_title: job?.title ?? "不明",
        company_name: job?.company_name ?? "不明",
        match_score: match.match_score,
        match_reasons: match.match_reasons,
        concerns: match.concerns,
      };
    });

    return Response.json({
      success: true,
      data: {
        candidate_name: candidate.name as string,
        matches,
      },
    });
  } catch (err) {
    console.error("[match-jobs] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
