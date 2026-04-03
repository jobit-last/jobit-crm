"use client";

import { useState, useEffect, useCallback } from "react";
import Spinner from "@/components/Spinner";

interface PortalUser {
  id: string;
  name: string;
  email: string | null;
  portal_login_id: string;
  portal_active: boolean;
  created_at: string;
  status: string;
}

export default function PortalUsersPage() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  // ID再発行結果
  const [reissueResult, setReissueResult] = useState<{ name: string; loginId: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/portal-users?${params}`);
      if (!res.ok) throw new Error("取得に失敗しました");
      const json = await res.json();
      setUsers(json.data || []);
      setCount(json.count || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleToggleActive(user: PortalUser) {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/portal-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active" }),
      });
      if (!res.ok) throw new Error("更新に失敗しました");
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReissueId(user: PortalUser) {
    if (!confirm(`${user.name} のログインIDを再発行しますか？現在のIDは無効になります。`)) return;
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/portal-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reissue_id" }),
      });
      if (!res.ok) throw new Error("再発行に失敗しました");
      const json = await res.json();
      setReissueResult({ name: user.name, loginId: json.portal_login_id });
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const totalPages = Math.ceil(count / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#002D37]">ポータルユーザー管理</h1>
      </div>

      {/* 検索・フィルター */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="名前・メール・IDで検索"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
        >
          <option value="">すべて</option>
          <option value="active">有効のみ</option>
          <option value="inactive">無効のみ</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* テーブル */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="px-6 py-12 text-center text-[#6B7280]">
            <Spinner size={24} className="inline mr-2" />読み込み中...
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#6B7280]">
            ポータルユーザーが見つかりません
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  ログインID
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  名前
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  メール
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  状態
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  登録日
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-[#002D37]">
                    {user.portal_login_id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#002D37]">
                    <a href={`/admin/candidates/${user.id}`} className="hover:underline">
                      {user.name}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        user.portal_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.portal_active ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {actionLoading === user.id ? (
                      <Spinner size={16} className="inline" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`text-sm mr-3 cursor-pointer ${
                            user.portal_active
                              ? "text-orange-600 hover:underline"
                              : "text-green-600 hover:underline"
                          }`}
                        >
                          {user.portal_active ? "無効化" : "有効化"}
                        </button>
                        <button
                          onClick={() => handleReissueId(user)}
                          className="text-sm text-[#002D37] hover:underline cursor-pointer"
                        >
                          ID再発行
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            前へ
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            次へ
          </button>
        </div>
      )}

      {/* ID再発行結果ダイアログ */}
      {reissueResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#002D37] mb-4">
              ログインID再発行完了
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
              <div>
                <span className="text-xs text-gray-500 block">対象ユーザー</span>
                <span className="text-sm font-medium text-[#002D37]">{reissueResult.name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">新しいログインID（初期パスワード）</span>
                <span className="text-lg font-mono font-bold text-[#002D37] tracking-wider">
                  {reissueResult.loginId}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              新しいIDを求職者にお伝えください。この画面を閉じると再表示できません。
            </p>
            <button
              onClick={() => setReissueResult(null)}
              className="w-full px-4 py-2.5 bg-[#002D37] text-white font-semibold rounded-lg hover:bg-[#003d4d] transition cursor-pointer"
            >
              確認しました
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
