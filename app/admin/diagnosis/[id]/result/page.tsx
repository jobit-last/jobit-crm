import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultClient from "./_components/ResultClient";
import type { DiagnosisHearing } from "@/types/diagnosis";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DiagnosisResultPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diagnosis_hearings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const hearing = data as DiagnosisHearing;

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/candidates" className="hover:underline" style={{ color: "#00A0B0" }}>
          求職者管理
        </Link>
        <span>/</span>
        <Link href="/admin/diagnosis/new" className="hover:underline" style={{ color: "#00A0B0" }}>
          AI市場価値診断
        </Link>
        <span>/</span>
        <span style={{ color: "#1A1A2E" }}>診断結果</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#1A1A2E" }}>
          AI市場価値診断レポート
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          {hearing.name} さんの市場価値診断結果
        </p>
      </div>

      <ResultClient hearing={hearing} />
    </div>
  );
}
