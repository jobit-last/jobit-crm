import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Candidate } from "@/types/candidate";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/candidate";
import type { Application } from "@/types/application";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types/application";

export default async function PortalDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");

  // 求職者情報をメールで取得
  const { data: candidateData, error: candidateError } = await supabase
    .from("candidates")
    .select("*, ca:users!candidates_ca_id_fkey(id, name)")
    .eq("email", user.email)
    .eq("is_deleted", false)
    .single();

  if (candidateError || !candidateData) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">求職者情報が見つかりません。</p>
        <p className="text-sm text-gray-400 mt-2">
          担当のキャリアアドバイザーにお問い合わせください。
        </p>
      </div>
    );
  }

  const candidate = candidateData as Candidate;

  // 進行中の選考を取得（直近3件）
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `*, job:jobs(id, title, company:companies(id, name))`
    )
    .eq("candidate_id", candidate.id)
    .not("status", "in", '("placed","failed","declined")')
    .order("created_at", { ascending: false })
    .limit(3);

  // 次の面接日程を取得
  const { data: nextInterview } = await supabase
    .from("interviews")
    .select("*, application:applications(id, job:jobs(id, title, company:companies(id, name)))")
    .eq("application.candidate_id", candidate.id)
    .gt("scheduled_at", new Date().toISOString())
    .is("result", null)
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      {/* Hero section with gradient */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #16B1F3, #0649C4)",
          boxShadow: "0 4px 20px rgba(6, 73, 196, 0.25)",
        }}
      >
        {/* Subtle decorative circles */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">
            こんにちは、{candidate.name}さん
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            今日も素敵なキャリアを見つけましょう
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[candidate.status]}`}
            >
              {STATUS_LABELS[candidate.status]}
            </span>
            {candidate.ca && (
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                担当CA: <span className="font-medium text-white">{candidate.ca.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div
          className="bg-white rounded-xl shadow-sm p-5 border-l-4"
          style={{ borderLeftColor: "#2394FF" }}
        >
          <p className="text-xs font-medium text-gray-400 mb-1">進行中の選考</p>
          <p className="text-3xl font-bold" style={{ color: "#2394FF" }}>
            {(applications as Application[] | null)?.length ?? 0}
          </p>
        </div>
        <div
          className="bg-white rounded-xl shadow-sm p-5 border-l-4"
          style={{ borderLeftColor: "#00B59A" }}
        >
          <p className="text-xs font-medium text-gray-400 mb-1">次の面接</p>
          {nextInterview?.scheduled_at ? (
            <p className="text-lg font-bold" style={{ color: "#21242B" }}>
              {new Date(nextInterview.scheduled_at).toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
              })}
              <span className="text-sm font-normal text-gray-500 ml-1">
                {new Date(nextInterview.scheduled_at).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          ) : (
            <p className="text-lg font-bold text-gray-300">予定なし</p>
          )}
        </div>
        <div
          className="bg-white rounded-xl shadow-sm p-5 border-l-4"
          style={{ borderLeftColor: "#F67A34" }}
        >
          <p className="text-xs font-medium text-gray-400 mb-1">ステータス</p>
          <p className="text-lg font-bold" style={{ color: "#21242B" }}>
            {STATUS_LABELS[candidate.status]}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link
          href="/portal/applications"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #16B1F3, #0649C4)",
            boxShadow: "0 2px 10px rgba(6, 73, 196, 0.2)",
          }}
        >
          選考一覧
        </Link>
        <Link
          href="/portal/schedule"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #16B1F3, #0649C4)",
            boxShadow: "0 2px 10px rgba(6, 73, 196, 0.2)",
          }}
        >
          スケジュール
        </Link>
        <Link
          href="/portal/interview-prep"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #16B1F3, #0649C4)",
            boxShadow: "0 2px 10px rgba(6, 73, 196, 0.2)",
          }}
        >
          面接対策
        </Link>
        <Link
          href="/portal/profile"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #16B1F3, #0649C4)",
            boxShadow: "0 2px 10px rgba(6, 73, 196, 0.2)",
          }}
        >
          プロフィール
        </Link>
      </div>

      {/* 進行中の選考 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "#16B1F3" }}>
            進行中の選考
          </h2>
          <Link
            href="/portal/applications"
            className="text-sm font-medium hover:underline"
            style={{ color: "#2394FF" }}
          >
            すべて見る
          </Link>
        </div>

        {!applications || applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">進行中の選考はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(applications as Application[]).map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4 transition-all hover:shadow-md"
                style={{ borderLeft: "3px solid #2394FF" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#21242B" }}>
                    {app.job?.title ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {app.job?.company?.name ?? "—"}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
                >
                  {APPLICATION_STATUS_LABELS[app.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 次の面接日程 */}
      <section>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#16B1F3" }}>
          次の面接日程
        </h2>

        {!nextInterview ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">予定されている面接はありません</p>
          </div>
        ) : (
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md"
            style={{ borderLeft: "3px solid #00B59A" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: "#21242B" }}>
                  {new Date(nextInterview.scheduled_at).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {nextInterview.location && (
                  <p className="text-xs text-gray-500 mt-1">
                    場所: {nextInterview.location}
                  </p>
                )}
                {nextInterview.interviewer && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    面接官: {nextInterview.interviewer}
                  </p>
                )}
              </div>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "#EBF5FF", color: "#2394FF" }}
              >
                予定
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
