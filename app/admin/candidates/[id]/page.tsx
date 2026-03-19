import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Candidate, StatusHistory } from "@/types/candidate";
import { STATUS_LABELS, STATUS_COLORS, GENDER_LABELS } from "@/types/candidate";
import DeleteButton from "./_components/DeleteButton";
import StatusManager from "./_components/StatusManager";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data, error }, { data: histories }] = await Promise.all([
    supabase
      .from("candidates")
      .select("*, ca:profiles!candidates_ca_id_fkey(id, full_name)")
      .eq("id", id)
      .eq("is_deleted", false)
      .single(),
    supabase
      .from("candidate_status_histories")
      .select("*, changer:profiles!changed_by(full_name)")
      .eq("candidate_id", id)
      .order("changed_at", { ascending: false }),
  ]);

  if (error || !data) notFound();

  const candidate = data as Candidate;

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/candidates" className="hover:underline" style={{ color: "#00A0B0" }}>
          求職者管理
        </Link>
        <span>/</span>
        <span style={{ color: "#1A1A2E" }}>{candidate.name}</span>
      </div>

      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1A1A2E" }}>
            {candidate.name}
          </h1>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[candidate.status]}`}
            >
              {STATUS_LABELS[candidate.status]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/candidates/${id}/edit`}
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#00A0B0" }}
          >
            編集
          </Link>
          <DeleteButton id={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 基本情報 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1A1A2E" }}>
            基本情報
          </h2>
          <dl className="space-y-3">
            <DetailRow label="メールアドレス" value={candidate.email} />
            <DetailRow label="電話番号" value={candidate.phone} />
            <DetailRow
              label="生年月日"
              value={
                candidate.birth_date
                  ? new Date(candidate.birth_date).toLocaleDateString("ja-JP")
                  : null
              }
            />
            <DetailRow
              label="性別"
              value={candidate.gender ? GENDER_LABELS[candidate.gender] : null}
            />
          </dl>
        </section>

        {/* 職歴・希望条件 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1A1A2E" }}>
            職歴・希望条件
          </h2>
          <dl className="space-y-3">
            <DetailRow label="現在の会社" value={candidate.current_company} />
            <DetailRow
              label="現在の年収"
              value={
                candidate.current_salary != null
                  ? `${candidate.current_salary.toLocaleString()} 万円`
                  : null
              }
            />
            <DetailRow
              label="希望年収"
              value={
                candidate.desired_salary != null
                  ? `${candidate.desired_salary.toLocaleString()} 万円`
                  : null
              }
            />
          </dl>
        </section>

        {/* 担当・管理情報 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1A1A2E" }}>
            担当・管理情報
          </h2>
          <dl className="space-y-3">
            <DetailRow label="担当CA" value={candidate.ca?.full_name ?? null} />
            <DetailRow
              label="登録日"
              value={new Date(candidate.created_at).toLocaleDateString("ja-JP")}
            />
            <DetailRow
              label="最終更新"
              value={new Date(candidate.updated_at).toLocaleDateString("ja-JP")}
            />
          </dl>
        </section>

        {/* ステータス管理 */}
        <StatusManager
          candidateId={id}
          currentStatus={candidate.status}
          histories={(histories as StatusHistory[]) ?? []}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-4">
      <dt className="w-32 flex-shrink-0 text-sm font-medium" style={{ color: "#6B7280" }}>
        {label}
      </dt>
      <dd className="text-sm" style={{ color: value ? "#1A1A2E" : "#9CA3AF" }}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
