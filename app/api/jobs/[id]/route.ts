import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("jobs")
      .select("*, companies(name)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, data: null, message: "求人が見つかりません", meta: {} },
        { status: 404 }
      );
    }

    const job = {
      ...data,
      company_name: (data.companies as { name: string } | null)?.name ?? null,
      companies: undefined,
    };

    return NextResponse.json({ success: true, data: job, message: "", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { company_id, title, description, job_type, location,
            salary_min, salary_max, required_skills, is_published } = body;

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return NextResponse.json(
        { success: false, data: null, message: "求人タイトルは必須です", meta: {} },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (company_id !== undefined) updateData.company_id = company_id || null;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description || null;
    if (job_type !== undefined) updateData.job_type = job_type || null;
    if (location !== undefined) updateData.location = location || null;
    if (salary_min !== undefined) updateData.salary_min = salary_min ? parseInt(salary_min) : null;
    if (salary_max !== undefined) updateData.salary_max = salary_max ? parseInt(salary_max) : null;
    if (required_skills !== undefined) updateData.required_skills = required_skills || null;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data, message: "更新しました", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: null, message: "削除しました", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
