import { createClient } from "@/lib/supabase/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToBuffer } = require("@react-pdf/renderer") as {
  renderToBuffer: (element: unknown) => Promise<Buffer>;
};
import { DiagnosisPdfDocument } from "@/lib/pdf/DiagnosisPdfDocument";
import { NextRequest } from "next/server";
import type { DiagnosisHearing } from "@/types/diagnosis";
import type { DiagnosisResult } from "@/app/api/diagnosis/analyze/route";
import React from "react";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diagnosis_hearings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return Response.json({ error: "診断データが見つかりません" }, { status: 404 });
  }

  const hearing = data as DiagnosisHearing & { analysis_result?: DiagnosisResult };

  if (!hearing.analysis_result) {
    return Response.json(
      { error: "分析結果がまだ保存されていません。診断結果画面を先に表示してください。" },
      { status: 404 }
    );
  }

  const buffer = await renderToBuffer(
    React.createElement(DiagnosisPdfDocument, {
      hearing,
      result: hearing.analysis_result,
    })
  );

  const safeName = hearing.name.replace(/[^\w\u3040-\u9FFF]/g, "_");
  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`AI診断レポート_${safeName}`)}.pdf`,
      "Cache-Control": "no-store",
    },
  });
}
