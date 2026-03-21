import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diagnosis_hearings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  if (!body.name) {
    return Response.json({ error: "氏名は必須です" }, { status: 400 });
  }

  const payload = {
    name: body.name,
    age: body.age ? Number(body.age) : null,
    education: body.education || null,
    company: body.company || null,
    industry: body.industry || null,
    occupation: body.occupation || null,
    current_salary: body.current_salary ? Number(body.current_salary) : null,
    tenure_years: body.tenure_years ? Number(body.tenure_years) : null,
    certifications:
      body.certifications?.filter((c: string) => c.trim()) ?? null,
    strengths: body.strengths || null,
    tools: body.tools || null,
    work_history: body.work_history || null,
    achievements: body.achievements || null,
    has_management: body.has_management ?? null,
    management_detail: body.management_detail || null,
    desired_occupation: body.desired_occupation || null,
    desired_salary: body.desired_salary ? Number(body.desired_salary) : null,
    desired_location: body.desired_location || null,
    desired_timing: body.desired_timing || null,
    ca_notes: body.ca_notes || null,
    ca_impression: body.ca_impression || null,
  };

  const { data, error } = await supabase
    .from("diagnosis_hearings")
    .insert(payload)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
