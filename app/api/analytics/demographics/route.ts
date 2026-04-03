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

// Helper to get age range label
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

// Helper to get salary range label
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const dimension = searchParams.get("dimension") || "gender";
    const ca_id = searchParams.get("ca_id");

    // Base query
    let query = supabase
      .from("candidates")
      .select("id, gender, birth_date, current_salary, status")
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

    const candidates = data || [];
    const total = candidates.length;
    const results: DemographicResult[] = [];
    const countMap: Record<string, number> = {};

    // Process candidates based on dimension
    if (dimension === "gender") {
      candidates.forEach((c) => {
        const label = c.gender ? (c.gender === "male" ? "男性" : c.gender === "female" ? "女性" : "その他") : "未設定";
        countMap[label] = (countMap[label] || 0) + 1;
      });
    } else if (dimension === "age") {
      candidates.forEach((c) => {
        const age = calculateAge(c.birth_date);
        const label = getAgeRangeLabel(age);
        countMap[label] = (countMap[label] || 0) + 1;
      });
    } else if (dimension === "salary") {
      candidates.forEach((c) => {
        const label = getSalaryRangeLabel(c.current_salary);
        countMap[label] = (countMap[label] || 0) + 1;
      });
    } else if (dimension === "status") {
      candidates.forEach((c) => {
        const label = STATUS_LABELS[c.status as keyof typeof STATUS_LABELS] || c.status;
        countMap[label] = (countMap[label] || 0) + 1;
      });
    }

    // Convert to sorted results with percentages
    const sortedLabels = Object.keys(countMap).sort();
    sortedLabels.forEach((label) => {
      const count = countMap[label];
      const percentage = total > 0 ? Math.round((count / total) * 10000) / 100 : 0;
      results.push({ label, count, percentage });
    });

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
