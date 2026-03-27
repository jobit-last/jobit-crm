import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Application } from "@/types/application";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/types/application";
import type { Interview } from "@/types/interview";
import InterviewsClient from "./_components/InterviewsClient";

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data, error }, { data: interviews }] = await Promise.all([
    supabase
      .from("applications")
      .select(
        `*,
        candidate:candidates(id, name),
        job:jobs(id, title, company:companies(id, name))`
      )
      .eq("id", id)
      .single(),
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
        <Link
          href={`/admin/applications/${id}`}
          className="hover:underline"
          style={{ color: "#002D37" }}
        >
          {app.candidate?.name} — {app.job?.title}
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>面接管理</span>
      </div>

      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#002D37" }}>
            面接管理
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {app.candidate?.name} / {app.job?.company?.name} / {app.job?.title}
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
            >
              {APPLICATION_STATUS_LABELS[app.status]}
            </span>
          </div>
        </div>
        <Link
          href={`/admin/applications/${id}`}
          className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          選考詳細に戻る
        </Link>
      </div>

      <InterviewsClient
        applicationId={id}
        initialInterviews={(interviews as Interview[]) ?? []}
      />
    </div>
  );
}
