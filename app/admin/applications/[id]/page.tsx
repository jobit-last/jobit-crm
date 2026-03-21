import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Application, ApplicationStatusHistory } from "@/types/application";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/types/application";
import type { Interview } from "@/types/interview";
import ApplicationStatusManager from "./_components/StatusManager";
import InterviewSection from "./_components/InterviewSection";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data, error }, { data: histories }, { data: interviews }] = await Promise.all([
    supabase
      .from("applications")
      .select(
        `*,
        candidate:candidates(id, name, email, phone),
        job:jobs(id, title, company:companies(id, name))`
      )
      .eq("id", id)
      .single(),
    supabase
      .from("application_status_histories")
      .select("*, changer:profiles!changed_by(full_name)")
      .eq("application_id", id)
      .order("changed_at", { ascending: false }),
    supabase
      .from("interviews")
      .select("*")
      .eq("application_id", id)
      .order("scheduled_at", { ascending: true }),
  ]);

  if (error || !data) notFound();

  const app = data as Application;

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/applications" className="hover:underline" style={{ color: "#002D37" }}>
          選考管理
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>
          {app.candidate?.name} — {app.job?.title}
        </span>
      </div>

      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#002D37" }}>
            {app.candidate?.name ?? "—"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            {app.job?.company?.name} / {app.job?.title}
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
            >
              {APPLICATION_STATUS_LABELS[app.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 選考基本情報 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            選考情報
          </h2>
          <dl className="space-y-3">
            <DetailRow label="求職者" value={app.candidate?.name} />
            <DetailRow label="メール" value={(app.candidate as any)?.email} />
            <DetailRow label="電話番号" value={(app.candidate as any)?.phone} />
            <DetailRow label="企業名" value={app.job?.company?.name} />
            <DetailRow label="求人名" value={app.job?.title} />
            <DetailRow
              label="応募日"
              value={
                app.applied_at
                  ? new Date(app.applied_at).toLocaleDateString("ja-JP")
                  : null
              }
            />
            <DetailRow
              label="登録日"
              value={new Date(app.created_at).toLocaleDateString("ja-JP")}
            />
          </dl>
        </section>

        {/* ステータス管理 */}
        <ApplicationStatusManager
          applicationId={id}
          currentStatus={app.status}
          histories={(histories as ApplicationStatusHistory[]) ?? []}
        />

        {/* 面接日程管理 */}
        <InterviewSection
          applicationId={id}
          initialInterviews={(interviews as Interview[]) ?? []}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-4">
      <dt className="w-28 flex-shrink-0 text-sm font-medium" style={{ color: "#6B7280" }}>
        {label}
      </dt>
      <dd className="text-sm" style={{ color: value ? "#002D37" : "#9CA3AF" }}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
