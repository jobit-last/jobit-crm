"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { Candidate, Advisor, CandidateStatus } from "@/types/candidate";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/candidate";

interface Props {
  candidates: Candidate[];
  totalCount: number;
  currentPage: number;
  limit: number;
  advisors: Advisor[];
  initialFilters: { name: string; status: string; ca_id: string };
}

export default function CandidatesClient({
  candidates,
  totalCount,
  currentPage,
  limit,
  advisors,
  initialFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [name, setName] = useState(initialFilters.name);
  const [status, setStatus] = useState(initialFilters.status);
  const [caId, setCaId] = useState(initialFilters.ca_id);

  const totalPages = Math.ceil(totalCount / limit);

  function applyFilters(overrides?: Partial<{ name: string; status: string; ca_id: string; page: number }>) {
    const params = new URLSearchParams();
    const n = overrides?.name ?? name;
    const s = overrides?.status ?? status;
    const c = overrides?.ca_id ?? caId;
    const p = overrides?.page ?? 1;
    if (n) params.set("name", n);
    if (s) params.set("status", s);
    if (c) params.set("ca_id", c);
    if (p > 1) params.set("page", String(p));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ page: 1 });
  }

  function handleReset() {
    setName("");
    setStatus("");
    setCaId("");
    startTransition(() => router.push(pathname));
  }

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">氏名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="氏名で検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>
          <div className="w-44">
            <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">すべて</option>
              {(Object.entries(STATUS_LABELS) as [CandidateStatus, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="w-44">
            <label className="block text-xs font-medium text-gray-600 mb-1">担当CA</label>
            <select
              value={caId}
              onChange={(e) => setCaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">すべて</option>
              {advisors.map((a) => (
                <option key={a.id} value={a.id}>{a.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752]"
              style={{ backgroundColor: "#00E05D", color: "#002D37" }}
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
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            全 <span className="font-semibold text-gray-700">{totalCount}</span> 件
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            該当する求職者が見つかりません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">氏名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">メール</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">電話番号</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">担当CA</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">登録日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/candidates/${c.id}`)}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "#002D37" }}>
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}
                      >
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.ca?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString("ja-JP")}
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
