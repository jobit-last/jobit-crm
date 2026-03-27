"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import type { Application, ApplicationStatus } from "@/types/application";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/types/application";

interface Props {
  applications: Application[];
  totalCount: number;
  currentPage: number;
  limit: number;
  initialFilters: { status: string; candidate_id: string };
}

export default function ApplicationsClient({
  applications,
  totalCount,
  currentPage,
  limit,
  initialFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [status, setStatus] = useState(initialFilters.status);
  const [candidateId, setCandidateId] = useState(initialFilters.candidate_id);

  const totalPages = Math.ceil(totalCount / limit);

  function applyFilters(overrides?: Partial<{ status: string; candidate_id: string; page: number }>) {
    const params = new URLSearchParams();
    const s = overrides?.status ?? status;
    const c = overrides?.candidate_id ?? candidateId;
    const p = overrides?.page ?? 1;
    if (s) params.set("status", s);
    if (c) params.set("candidate_id", c);
    if (p > 1) params.set("page", String(p));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ page: 1 });
  }

  function handleReset() {
    setStatus("");
    setCandidateId("");
    startTransition(() => router.push(pathname));
  }

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="w-52">
            <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">すべて</option>
              {(Object.entries(APPLICATION_STATUS_LABELS) as [ApplicationStatus, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                )
              )}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00A645]"
              style={{ backgroundColor: "#00E05D" }}
            >
              検索
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              リセット
            </button>
          </div>
        </form>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <span className="text-sm text-gray-500">
            全 <span className="font-semibold text-gray-700">{totalCount}</span> 件
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            該当する選考が見つかりません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">求職者名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">企業名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">求人名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">応募日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/applications/${app.id}`)}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "#002D37" }}>
                      {app.candidate?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {app.job?.company?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {app.job?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}
                      >
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString("ja-JP")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => applyFilters({ page: currentPage - 1 })}
            className="px-3 py-1.5 rounded-md text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            前へ
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => applyFilters({ page: p })}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  p === currentPage
                    ? "text-white border-transparent"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
                style={p === currentPage ? { backgroundColor: "#002D37" } : undefined}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => applyFilters({ page: currentPage + 1 })}
            className="px-3 py-1.5 rounded-md text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
