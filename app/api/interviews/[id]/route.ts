import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { ApplicationStatus } from "@/types/application";
import type { InterviewType, InterviewResult } from "@/types/interview";

type Params = { params: Promise<{ id: string }> };

// 面接種別 × 合否 → 選考ステータス自動更新マップ
const STATUS_MAP: Record<string, ApplicationStatus> = {
  "first|pass":     "second_interview",
  "second|pass":    "final_interview",
  "final|pass":     "offered",
  "executive|pass": "offered",
  "first|fail":     "failed",
  "second|fail":    "failed",
  "final|fail":     "failed",
  "executive|fail": "failed",
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("interviews")
      .select(
        `*,
        application:applications(
          id, status,
          candidate:candidates(id, name),
          job:jobs(id, title, company:companies(id, name))
        )`
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "面接が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { result, feedback } = body as { result: InterviewResult; feedback?: string };

    // 面接結果を保存
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .update({ result, feedback: feedback || null })
      .eq("id", id)
      .select(`*, application:applications(id, status, candidate:candidates(id, name), job:jobs(id, title))`)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json({ error: interviewError?.message ?? "更新失敗" }, { status: 500 });
    }

    // 選考ステータス自動更新
    const interviewType = interview.interview_type as InterviewType;
    const newStatus = STATUS_MAP[`${interviewType}|${result}`];

    if (newStatus) {
      const applicationId = interview.application_id as string;
      await supabase
        .from("applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", applicationId);
    }

    return NextResponse.json({
      data: interview,
      status_updated: newStatus ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
