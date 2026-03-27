"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCompare, useFavorites } from "@/app/portal/_lib/storage";
import { formatSalary } from "@/app/portal/_components/JobCard";
import type { Job } from "@/types/job";

const ACCENT = "#2394FF";
const GRADIENT_B = "linear-gradient(135deg, #16B1F3, #0649C4)";
const GRADIENT_O = "linear-gradient(135deg, #EE542F, #F67A34, #FFA639)";

const CARD_TOP_COLORS = ["#16B1F3", "#0649C4", "#00B59A"];

export default function ComparePage() {
  const { compareIds, remove: removeCompare, clear } = useCompare();
  const { favorites, toggle: toggleFav } = useFavorites();
  const [jobs, setJobs]     = useState<(Job | null)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) { setJobs([]); return; }
    setLoading(true);
    Promise.all(
      compareIds.map((id) =>
        fetch(`/api/jobs/${id}`)
          .then((r) => r.json())
          .then((j) => (j.success ? j.data : null))
          .catch(() => null)
      )
    ).then((results) => {
      setJobs(results);
      setLoading(false);
    });
  }, [compareIds]);

  const validJobs = jobs.filter((j): j is Job => j !== null);

  const rows: { label: string; key: keyof Job; format?: (v: unknown, job: Job) => string; highlight?: boolean }[] = [
    { label: "企業名",   key: "company_name" },
    { label: "職種",     key: "job_type" },
    { label: "勤務地",   key: "location" },
    {
      label: "年収",
      key: "salary_min",
      format: (_, job) => formatSalary(job.salary_min, job.salary_max),
      highlight: true,
    },
  ];

  return (
    <div style={{ backgroundColor: "#F2F6FF", minHeight: "100vh" }}>
      {/* グラデーションヘッダー */}
      <div style={{ background: GRADIENT_B }} className="py-10 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-white">求人比較</h1>
            <p className="text-sm text-blue-100">最大3件の求人を横並びで比較できます</p>
          </div>
          {compareIds.length > 0 && (
            <button
              onClick={clear}
              className="text-xs text-white/70 hover:text-white border border-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              リストをクリア
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {compareIds.length === 0 ? (
          /* 空状態 */
          <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: GRADIENT_B }}
            >
              <span className="text-3xl text-white">⚖️</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">比較リストが空です</p>
            <p className="text-xs text-gray-300 mb-6">求人検索で「＋比較に追加」を押して追加してください</p>
            <Link
              href="/portal/jobs/search"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 shadow-md"
              style={{ background: GRADIENT_B }}
            >
              求人を探す
            </Link>
          </div>
        ) : loading ? (
          <div className="animate-pulse bg-white rounded-2xl border border-gray-100 h-64" />
        ) : (
          <div className="space-y-6">
            {/* ジョブカード（ヘッダー） */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {validJobs.map((job, idx) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden"
                  style={{ borderTop: `4px solid ${CARD_TOP_COLORS[idx % CARD_TOP_COLORS.length]}` }}
                >
                  {/* 削除ボタン */}
                  <button
                    onClick={() => removeCompare(job.id)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-lg transition-colors"
                    aria-label="比較から削除"
                  >
                    ×
                  </button>

                  {/* お気に入り */}
                  <button
                    onClick={() => toggleFav(job.id)}
                    className="absolute top-3 right-8 text-lg transition-transform hover:scale-110"
                  >
                    {favorites.has(job.id)
                      ? <span style={{ color: "#FF4D6D" }}>♥</span>
                      : <span className="text-gray-200">♡</span>}
                  </button>

                  <p className="text-xs mb-1 pr-14 truncate" style={{ color: "#16B1F3" }}>{job.company_name ?? "—"}</p>
                  <h2 className="text-sm font-bold leading-snug mb-3 pr-12" style={{ color: "#21242B" }}>
                    {job.title}
                  </h2>
                  <Link
                    href={`/portal/jobs/${job.id}`}
                    className="block text-center py-2 rounded-xl text-xs font-semibold text-white hover:opacity-80 transition-opacity shadow-md"
                    style={{ background: GRADIENT_B }}
                  >
                    詳細を見る
                  </Link>
                </div>
              ))}
            </div>

            {/* 比較テーブル */}
            <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <tbody className="divide-y divide-gray-50">
                  {rows.map(({ label, key, format, highlight }) => (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td
                        className="px-5 py-4 text-xs font-semibold w-28 shrink-0 align-middle"
                        style={{ color: "#16B1F3", backgroundColor: "#F8FBFF" }}
                      >
                        {label}
                      </td>
                      {validJobs.map((job) => {
                        const raw   = job[key];
                        const value = format
                          ? format(raw, job)
                          : (raw as string | null | undefined) ?? "—";
                        return (
                          <td
                            key={job.id}
                            className={`px-5 py-4 text-sm align-middle border-l border-gray-50 ${highlight ? "font-bold" : "text-gray-700"}`}
                            style={highlight ? {
                              background: GRADIENT_O,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            } : undefined}
                          >
                            {value || "—"}
                          </td>
                        );
                      })}
                      {/* 空きスロット */}
                      {Array.from({ length: 3 - validJobs.length }).map((_, i) => (
                        <td key={`empty-${i}`} className="px-5 py-4 border-l border-gray-50" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 比較に追加するボタン（3件未満のとき） */}
            {compareIds.length < 3 && (
              <div className="text-center">
                <Link
                  href="/portal/jobs/search"
                  className="inline-flex items-center gap-2 text-sm border-2 border-dashed rounded-2xl px-8 py-4 transition-colors hover:bg-blue-50"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  <span className="text-xl">+</span>
                  もう1件追加する（{compareIds.length}/3）
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
