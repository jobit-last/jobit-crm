"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ApplicationStatus, ApplicationStatusHistory } from "@/types/application";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/types/application";

interface Props {
  applicationId: string;
  currentStatus: ApplicationStatus;
  histories: ApplicationStatusHistory[];
}

export default function ApplicationStatusManager({
  applicationId,
  currentStatus,
  histories,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<ApplicationStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanged = selected !== currentStatus;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasChanged) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
        選考ステータス管理
      </h2>

      {/* 変更フォーム */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              現在のステータス
            </label>
            <div className="mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[currentStatus]}`}
              >
                {APPLICATION_STATUS_LABELS[currentStatus]}
              </span>
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              変更先ステータス
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              {(Object.entries(APPLICATION_STATUS_LABELS) as [ApplicationStatus, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                )
              )}
            </select>
          </div>
          <button
            type="submit"
            disabled={!hasChanged || loading}
            className="px-4 py-2 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00c752] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#00E05D" }}
          >
            {loading ? "保存中..." : "変更する"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      {/* 選考履歴 */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          選考履歴
        </h3>

        {histories.length === 0 ? (
          <p className="text-sm text-gray-400">変更履歴はありません</p>
        ) : (
          <ol className="relative border-l-2 border-gray-100 space-y-4 ml-2">
            {histories.map((h) => (
              <li key={h.id} className="ml-4">
                <span
                  className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white"
                  style={{ backgroundColor: "#002D37" }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  {h.from_status && (
                    <>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[h.from_status]}`}
                      >
                        {APPLICATION_STATUS_LABELS[h.from_status]}
                      </span>
                      <span className="text-gray-400 text-xs">→</span>
                    </>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[h.to_status]}`}
                  >
                    {APPLICATION_STATUS_LABELS[h.to_status]}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
                  {new Date(h.changed_at).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {h.changer?.full_name && (
                    <span className="ml-2">by {h.changer.full_name}</span>
                  )}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
