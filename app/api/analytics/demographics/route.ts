import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS } from "@/types/candidate";

interface DemographicResult {
  label: string;
  count: number;
  percentage: number;
}

// Helper to calculate age from birth_date
function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getAgeRangeLabel(age: number | null): string {
  if (age === null) return "未設定";
  if (age <= 20) return "~20歳";
  if (age <= 25) return "21~25歳";
  if (age <= 30) return "26~30歳";
  if (age <= 35) return "31~35歳";
  if (age <= 40) return "36~40歳";
  if (age <= 45) return "41~45歳";
  if (age <= 50) return "46~50歳";
  return "51歳~";
}

function getSalaryRangeLabel(salary: number | null): string {
  if (salary === null) return "未設定";
  if (salary < 300) return "~300万";
  if (salary < 400) return "300~400万";
  if (salary < 500) return "400~500万";
  if (salary < 600) return "500~600万";
  if (salary < 700) return "600~700万";
  if (salary < 800) return "700~800万";
  if (salary < 1000) return "800~1000万";
  return "1000万~";
}

function getExperienceLabel(years: number | null): string {
  if (years === null) return "未設定";
  if (years <= 1) return "~1年";
  if (years <= 3) return "2~3年";
  if (years <= 5) return "4~5年";
  if (years <= 10) return "6~10年";
  if (years <= 15) return "11~15年";
  return "16年~";
}

function getConversationLabel(score: number | null): string {
  if (score === null) return "未設定";
  if (score <= 3) return "少ない (1-3)";
  if (score <= 5) return "普通 (4-5)";
  if (score <= 7) return "やや多い (6-7)";
  return "多い (8-10)";
}

// 全16次元に対応するselect文のカラム
const ALL_COLUMNS =
  "id, gender, birth_date, current_salary, status, experience_years, education, residence, is_active, other_agent, medical_history, arts_science, desired_occupation, personality_color, desired_employment_type, relocation_willingness, conversation_score";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const dimension = searchParams.get("dimension") || "gender";
    const ca_id = searchParams.get("ca_id");

    let query = supabase
      .from("candidates")
      .select(ALL_COLUMNS)
      .eq("is_deleted", false);

    if (ca_id) {
      query = query.eq("ca_id", ca_id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    const candidates = (data || []) as Record<string, unknown>[];
    const total = candidates.length;
    const countMap: Record<string, number> = {};

    // Process candidates based on dimension
    switch (dimension) {
      case "gender":
        candidates.forEach((c) => {
          const g = c.gender as string | null;
          const label = g ? (g === "male" ? "男性" : g === "female" ? "女性" : "その他") : "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "age":
        candidates.forEach((c) => {
          const age = calculateAge(c.birth_date as string | null);
          const label = getAgeRangeLabel(age);
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "salary":
        candidates.forEach((c) => {
          const label = getSalaryRangeLabel(c.current_salary as number | null);
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "status":
        candidates.forEach((c) => {
          const s = c.status as string;
          const label = STATUS_LABELS[s as keyof typeof STATUS_LABELS] || s;
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "experience":
        candidates.forEach((c) => {
          const label = getExperienceLabel(c.experience_years as number | null);
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "education":
        candidates.forEach((c) => {
          const label = (c.education as string) || "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "residence":
        candidates.forEach((c) => {
          const label = (c.residence as string) || "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "active":
        candidates.forEach((c) => {
          const active = c.is_active as boolean | null;
          const label = active === true ? "アクティブ" : active === false ? "非アクティブ" : "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "other_agent":
        candidates.forEach((c) => {
          const label = (c.other_agent as string) || "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "medical_history":
        candidates.forEach((c) => {
          const label = (c.medical_history as string) || "未確認";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "arts_science":
        candidates.forEach((c) => {
          const label = (c.arts_science as string) || "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "occupation":
        candidates.forEach((c) => {
          const label = (c.desired_occupation as string) || "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "color":
        candidates.forEach((c) => {
          const label = (c.personality_color as string) || "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "employment_type":
        candidates.forEach((c) => {
          const label = (c.desired_employment_type as string) || "未設定";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "relocation":
        candidates.forEach((c) => {
          const label = (c.relocation_willingness as string) || "未確認";
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      case "conversation":
        candidates.forEach((c) => {
          const label = getConversationLabel(c.conversation_score as number | null);
          countMap[label] = (countMap[label] || 0) + 1;
        });
        break;

      default:
        // unknown dimension — return empty
        break;
    }

    // Convert to sorted results with percentages
    const results: DemographicResult[] = Object.entries(countMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, count]) => ({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }));

    return NextResponse.json({
      success: true,
      data: results,
      message: "",
      meta: { dimension, ca_id, total },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, data: null, message, meta: {} },
      { status: 500 }
    );
  }
}
