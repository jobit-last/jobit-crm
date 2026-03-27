import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";

const ALLOWED_SORT_COLUMNS = ["title", "job_type", "location", "salary_min", "salary_max", "is_published", "created_at"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword") || "";
    const job_type = searchParams.get("job_type") || "";
    const location = searchParams.get("location") || "";
    const salary_min = searchParams.get("salary_min") || "";
    const salary_max = searchParams.get("salary_max") || "";
    const is_published = searchParams.get("is_published") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const per_page = parseInt(searchParams.get("per_page") || "20", 10);
    const sort_by = searchParams.get("sort_by") || "created_at";
    const sort_order = searchParams.get("sort_order") === "asc";

    const safeSortBy = ALLOWED_SORT_COLUMNS.includes(sort_by) ? sort_by : "created_at";

    let query = supabase
      .from("jobs")
      .select("*, companies(name)", { count: "exact" });

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,required_skills.ilike.%${keyword}%`);
    }
    if (job_type) query = query.ilike("job_type", `%${job_type}%`);
    if (location) query = query.ilike("location", `%${location}%`);
    if (salary_min) query = query.gte("salary_min", parseInt(salary_min));
    if (salary_max) query = query.lte("salary_max", parseInt(salary_max));
    if (is_published !== "") query = query.eq("is_published", is_published === "true");

    query = query.order(safeSortBy, { ascending: sort_order });

    const from = (page - 1) * per_page;
    query = query.range(from, from + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: [], message: error.message, meta: {} },
        { status: 500 }
      );
    }

    const jobs = (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      company_name: (row.companies as { name: string } | null)?.name ?? null,
      companies: undefined,
    }));

    const total = count || 0;
    return NextResponse.json({
      success: true,
      data: jobs,
      message: "",
      meta: { total, page, per_page, total_pages: Math.ceil(total / per_page) },
    });
  } catch {
    return NextResponse.json(
      { success: false, data: [], message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { company_id, title, description, job_type, location,
            salary_min, salary_max, required_skills, is_published } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { success: false, data: null, message: "求人タイトルは必須です", meta: {} },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        company_id: company_id || null,
        title: title.trim(),
        description: description || null,
        job_type: job_type || null,
        location: location || null,
        salary_min: salary_min ? parseInt(salary_min) : null,
        salary_max: salary_max ? parseInt(salary_max) : null,
        required_skills: required_skills || null,
        is_published: is_published ?? false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("create", `求人作成: ${title.trim()}`);
    return NextResponse.json(
      { success: true, data, message: "求人を登録しました", meta: {} },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
