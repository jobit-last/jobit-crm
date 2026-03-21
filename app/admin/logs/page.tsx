"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActivityLog, LogAction } from "@/types/activity-log";

const ACTION_LABELS: Record<LogAction, string> = {
  login: "ログイン",
  logout: "ログアウト",
  create: "作成",
  update: "更新",
  delete: "削除",
};

const ACTION_COLORS: Record<LogAction, string> = {
  login: "bg-blue-100 text-blue-700",
  logout: "bg-gray-100 text-gray-700",
  create: "bg-green-100 text-green-700",
  update: "bg-yellow-100 text-yellow-700",
  delete: "bg-red-100 text-red-700",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 30;

  // Filters
  const [userName, setUserName] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail modal
  const [detail, setDetail] = useState<ActivityLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (userName) params.set("user_name", userName);
      if (action) params.set("action", action);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await fetch(`/api/logs?${params}`);
      if (!res.ok) throw new Error("ログの取得に失敗しました");
      const json = await res.json();
      setLogs(json.data);
      setTotalCount(json.count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [page, userName, action, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  }

  function handleReset() {
    setUserName("");
    setAction("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const totalPages = Math.ceil(totalCount / limit);

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#002D37]">操作ログ</h1>

      {/* Search Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              ユーザー名 / メール
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              操作種別
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]"
            >
              <option value="">すべて</option>
              {(Object.keys(ACTION_LABELS) as LogAction[]).map((key) => (
                <option key={key} value={key}>
                  {ACTION_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              開始日
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              終了日
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-[#002D37] text-white text-sm font-medium rounded-lg hover:bg-[#003d4a] transition cursor-pointer"
          >
            検索
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-sm text-[#6B7280] rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            リセット
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="px-6 py-12 text-center text-[#6B7280]">読み込み中...</div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#6B7280]">
            操作ログがありません
          </div>
        ) : (
          <table className="w-full min-w-[768px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  日時
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  操作
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  対象
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  IPアドレス
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-3 text-sm text-[#002D37] whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-6 py-3 text-sm text-[#002D37]">
                    {log.user_name}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        ACTION_COLORS[log.action as LogAction] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ACTION_LABELS[log.action as LogAction] ?? log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#6B7280] max-w-xs truncate">
                    {log.target}
                  </td>
                  <td className="px-6 py-3 text-sm text-[#6B7280] font-mono">
                    {log.ip_address ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => setDetail(log)}
                      className="text-sm text-[#002D37] hover:underline cursor-pointer"
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-[#6B7280]">
              全 {totalCount} 件中 {(page - 1) * limit + 1}〜
              {Math.min(page * limit, totalCount)} 件
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-[#002D37] mb-4">
              操作ログ詳細
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex">
                <dt className="w-28 shrink-0 font-medium text-[#6B7280]">日時</dt>
                <dd className="text-[#002D37]">{formatDateTime(detail.created_at)}</dd>
              </div>
              <div className="flex">
                <dt className="w-28 shrink-0 font-medium text-[#6B7280]">ユーザー</dt>
                <dd className="text-[#002D37]">
                  {detail.user_name}
                  {detail.user_email && (
                    <span className="ml-2 text-[#6B7280]">({detail.user_email})</span>
                  )}
                </dd>
              </div>
              <div className="flex">
                <dt className="w-28 shrink-0 font-medium text-[#6B7280]">操作</dt>
                <dd>
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      ACTION_COLORS[detail.action as LogAction] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ACTION_LABELS[detail.action as LogAction] ?? detail.action}
                  </span>
                </dd>
              </div>
              <div className="flex">
                <dt className="w-28 shrink-0 font-medium text-[#6B7280]">対象</dt>
                <dd className="text-[#002D37] break-all">{detail.target}</dd>
              </div>
              <div className="flex">
                <dt className="w-28 shrink-0 font-medium text-[#6B7280]">IPアドレス</dt>
                <dd className="text-[#002D37] font-mono">{detail.ip_address ?? "-"}</dd>
              </div>
              <div className="flex">
                <dt className="w-28 shrink-0 font-medium text-[#6B7280]">ログID</dt>
                <dd className="text-[#6B7280] font-mono text-xs">{detail.id}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <button
                onClick={() => setDetail(null)}
                className="w-full px-4 py-2.5 border border-gray-300 text-[#002D37] rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
