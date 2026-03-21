import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Application, ApplicationStatus, ApplicationStatusHistory } from "@/types/application";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types/application";
import type { Interview } from "@/types/interview";
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_COLORS,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_RESULT_COLORS,
} from "@/types/interview";

const PROGRESS_STEPS: { key: ApplicationStatus[]; label: string }[] = [
  { key: ["document_screening"], label: "書類選考" },
  { key: ["first_interview", "second_interview", "final_interview"], label: "面接" },
  { key: ["offered", "placed"], label: "内定" },
];

function getProgressIndex(status: ApplicationStatus): number {
  if (["offered", "placed"].includes(status)) return 2;
  if (["first_interview", "second_interview", "final_interview"].includes(status)) return 1;
  return 0;
}

export default async function PortalApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  // 求職者を取得して権限チェック
  const { data: candidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .eq("is_deleted", false)
    .single();

  if (!candidate) notFound();

  const [{ data, error }, { data: histories }, { data: interviews }] = await Promise.all([
    supabase
      .from("applications")
      .select(
        `*, job:jobs(id, title, company:companies(id, name))`
      )
      .eq("id", id)
      .eq("candidate_id", candidate.id)
      .single(),
    supabase
      .from("application_status_histories")
      .select("*")
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
  const progressIdx = getProgressIndex(app.status);

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/portal/applications" className="hover:underline" style={{ color: "#2394FF" }}>
          選考状況
        </Link>
        <span>/</span>
        <span style={{ color: "#21242B" }}>{app.job?.title}</span>
      </div>

      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#21242B" }}>
          {app.job?.title ?? "—"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{app.job?.company?.name ?? "—"}</p>
        <div className="mt-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
          >
            {APPLICATION_STATUS_LABELS[app.status]}
          </span>
        </div>
      </div>

      {/* 進捗バー（大） */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">選考進捗</h2>
        <div className="flex items-center gap-2">
          {PROGRESS_STEPS.map((step, i) => {
            const isComplete = i <= progressIdx;
            const isCurrent = i === progressIdx;
            return (
              <div key={step.label} className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: isComplete ? "#2394FF" : "#E5E7EB",
                      color: isComplete ? "#fff" : "#9CA3AF",
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div
                      className="flex-1 h-1 rounded-full"
                      style={{
                        backgroundColor: i < progressIdx ? "#2394FF" : "#E5E7EB",
                      }}
                    />
                  )}
                </div>
                <p
                  className="text-xs ml-1"
                  style={{
                    color: isCurrent ? "#2394FF" : "#9CA3AF",
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#21242B" }}>
            選考情報
          </h2>
          <dl className="space-y-3">
            <Row label="企業名" value={app.job?.company?.name} />
            <Row label="求人名" value={app.job?.title} />
            <Row
              label="応募日"
              value={app.applied_at ? new Date(app.applied_at).toLocaleDateString("ja-JP") : null}
            />
            <Row
              label="登録日"
              value={new Date(app.created_at).toLocaleDateString("ja-JP")}
            />
          </dl>
        </section>

        {/* 面接日程 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#21242B" }}>
            面接日程
          </h2>
          {!interviews || interviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">面接日程はありません</p>
          ) : (
            <ul className="space-y-3">
              {(interviews as Interview[]).map((iv) => (
                <li key={iv.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${INTERVIEW_TYPE_COLORS[iv.interview_type]}`}
                    >
                      {INTERVIEW_TYPE_LABELS[iv.interview_type]}
                    </span>
                    {iv.result && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${INTERVIEW_RESULT_COLORS[iv.result]}`}
                      >
                        {INTERVIEW_RESULT_LABELS[iv.result]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium" style={{ color: "#21242B" }}>
                    {new Date(iv.scheduled_at).toLocaleString("ja-JP", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {iv.location && (
                    <p className="text-xs text-gray-500 mt-0.5">場所: {iv.location}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 選考履歴 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#21242B" }}>
            選考履歴
          </h2>
          {!histories || histories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">変更履歴はありません</p>
          ) : (
            <ol className="relative border-l-2 border-gray-100 ml-2 space-y-4">
              {(histories as ApplicationStatusHistory[]).map((h) => (
                <li key={h.id} className="ml-4">
                  <span
                    className="absolute -left-[7px] w-3 h-3 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: "#2394FF" }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    {h.from_status && (
                      <>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${APPLICATION_STATUS_COLORS[h.from_status]}`}
                        >
                          {APPLICATION_STATUS_LABELS[h.from_status]}
                        </span>
                        <span className="text-gray-400 text-xs">→</span>
                      </>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${APPLICATION_STATUS_COLORS[h.to_status]}`}
                    >
                      {APPLICATION_STATUS_LABELS[h.to_status]}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(h.changed_at).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-4">
      <dt className="w-24 flex-shrink-0 text-sm text-gray-400">{label}</dt>
      <dd className="text-sm" style={{ color: value ? "#21242B" : "#9CA3AF" }}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
