import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Application, ApplicationStatus } from "@/types/application";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/types/application";

// 進捗ステップ定義
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

// ステータスに応じた左ボーダー色
function getStatusBorderColor(status: ApplicationStatus): string {
  if (["offered", "placed"].includes(status)) return "#00B59A";
  if (["first_interview", "second_interview", "final_interview"].includes(status)) return "#2394FF";
  if (["failed", "declined"].includes(status)) return "#9CA3AF";
  return "#F67A34";
}

export default async function PortalApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .eq("is_deleted", false)
    .single();

  if (!candidate) {
    return (
      <div className="text-center py-16 text-gray-500">
        求職者情報が見つかりません。
      </div>
    );
  }

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `*, job:jobs(id, title, company:companies(id, name))`
    )
    .eq("candidate_id", candidate.id)
    .order("created_at", { ascending: false });

  const apps = (applications as Application[]) ?? [];
  const active = apps.filter((a) => !["placed", "failed", "declined"].includes(a.status));
  const closed = apps.filter((a) => ["placed", "failed", "declined"].includes(a.status));

  return (
    <div style={{ backgroundColor: "#F2F6FF", minHeight: "100%" }} className="pb-8">
      {/* Hero Header */}
      <div
        className="rounded-2xl px-4 sm:px-8 py-6 sm:py-8 mb-8 shadow-lg"
        style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
      >
        <h1 className="text-2xl font-bold text-white">選考状況</h1>
        <p className="text-white/70 text-sm mt-1">応募の進捗をまとめて確認できます</p>
      </div>

      {/* 進行中 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "#16B1F3" }}>
          進行中（{active.length}件）
        </h2>

        {active.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-gray-400">進行中の選考はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((app) => {
              const progressIdx = getProgressIndex(app.status);
              const borderColor = getStatusBorderColor(app.status);
              return (
                <Link
                  key={app.id}
                  href={`/portal/applications/${app.id}`}
                  className="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border-l-4"
                  style={{ borderLeftColor: borderColor }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#21242B" }}>
                        {app.job?.title ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {app.job?.company?.name ?? "—"}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
                    >
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  </div>

                  {/* 進捗バー */}
                  <div className="flex items-center gap-1">
                    {PROGRESS_STEPS.map((step, i) => {
                      const isComplete = i <= progressIdx;
                      const isCurrent = i === progressIdx;
                      return (
                        <div key={step.label} className="flex-1">
                          <div
                            className="h-2 rounded-full transition-colors"
                            style={{
                              background: isComplete
                                ? "linear-gradient(135deg, #16B1F3, #0649C4)"
                                : "#E5E7EB",
                            }}
                          />
                          <p
                            className="text-[10px] mt-1 text-center"
                            style={{
                              color: isCurrent ? "#16B1F3" : "#9CA3AF",
                              fontWeight: isCurrent ? 600 : 400,
                            }}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {app.applied_at && (
                    <p className="text-[11px] mt-3" style={{ color: "#2394FF" }}>
                      応募日: {new Date(app.applied_at).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 終了した選考 */}
      {closed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#16B1F3" }}>
            終了（{closed.length}件）
          </h2>
          <div className="space-y-3">
            {closed.map((app) => (
              <Link
                key={app.id}
                href={`/portal/applications/${app.id}`}
                className="block bg-white rounded-2xl shadow-sm p-4 opacity-70 hover:opacity-100 transition-all border-l-4"
                style={{ borderLeftColor: getStatusBorderColor(app.status) }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#21242B" }}>
                      {app.job?.title ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.job?.company?.name ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
