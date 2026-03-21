import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePdfDocument } from "@/lib/pdf/ResumePdfDocument";
import { NextRequest } from "next/server";
import type { Resume } from "@/types/resume";
import React from "react";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; resumeId: string }> }
) {
  const { id, resumeId } = await params;
  const supabase = await createClient();

  const [{ data: resume, error: resumeError }, { data: candidate, error: candidateError }] =
    await Promise.all([
      supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .eq("candidate_id", id)
        .single(),
      supabase
        .from("candidates")
        .select("name, email, phone, birth_date, gender")
        .eq("id", id)
        .single(),
    ]);

  if (resumeError || !resume) {
    return Response.json({ error: "履歴書が見つかりません" }, { status: 404 });
  }
  if (candidateError || !candidate) {
    return Response.json({ error: "求職者が見つかりません" }, { status: 404 });
  }

  const typedResume = resume as Resume;

  const buffer = await renderToBuffer(
    React.createElement(ResumePdfDocument, {
      candidate,
      content: typedResume.content,
      version: typedResume.version,
    }) as any
  );

  const safeName = candidate.name.replace(/[^\w\u3040-\u9FFF]/g, "_");
  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`履歴書_${safeName}_v${typedResume.version}`)}.pdf`,
      "Cache-Control": "no-store",
    },
  });
}
