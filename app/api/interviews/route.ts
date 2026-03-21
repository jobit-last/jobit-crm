import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const application_id = searchParams.get("application_id") || "";
    const result        = searchParams.get("result") || "";
    const page          = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit         = 20;
    const from          = (page - 1) * limit;

    let query = supabase
      .from("interviews")
      .select(
        `*,
        application:applications(
          id, status,
          candidate:candidates(id, name),
          job:jobs(id, title, company:companies(id, name))
        )`,
        { count: "exact" }
      )
      .order("scheduled_at", { ascending: false })
      .range(from, from + limit - 1);

    if (application_id) query = query.eq("application_id", application_id);
    if (result)         query = query.eq("result", result);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data ?? [], count, page, limit });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { application_id, interview_type, scheduled_at, location, interviewer } = body;

    if (!application_id || !interview_type || !scheduled_at) {
      return NextResponse.json(
        { error: "選考・面接種別・日時は必須です" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("interviews")
      .insert({
        application_id,
        interview_type,
        scheduled_at,
        location: location || null,
        interviewer: interviewer || null,
      })
      .select(
        `*,
        application:applications(
          id, status,
          candidate:candidates(id, name),
          job:jobs(id, title, company:companies(id, name))
        )`
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
