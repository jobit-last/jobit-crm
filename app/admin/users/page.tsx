"use client";

import { useState, useEffect, useCallback } from "react";
import type { User, UserRole } from "@/types/user";

type ModalMode = "create" | "edit";

interface FormData {
  name: string;
  email: string;
  role: UserRole;
}

const INITIAL_FORM: FormData = { name: "", email: "", role: "ca" };

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  ca: "CA",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("ユーザー一覧の取得に失敗しました");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openCreate() {
    setForm(INITIAL_FORM);
    setModalMode("create");
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setForm({ name: user.name, email: user.email, role: user.role });
    setModalMode("edit");
    setEditingId(user.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = modalMode === "create" ? "/api/users" : `/api/users/${editingId}`;
      const method = modalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      closeModal();
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }
      setDeleteTarget(null);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#EBEEEF]">
      {/* Header */}
      <header className="bg-[#002D37] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Jobit CRM</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/admin/dashboard" className="text-white/70 hover:text-white transition">
              ダッシュボード
            </a>
            <a href="/admin/users" className="text-white font-medium">
              ユーザー管理
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#002D37]">ユーザー管理</h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00c752] transition cursor-pointer"
          >
            + 新規登録
          </button>
        </div>

        {/* Error */}
        {error && !modalOpen && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center text-[#6B7280]">読み込み中...</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#6B7280]">
              ユーザーが登録されていません
            </div>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    名前
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    メール
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    役割
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
                    <td className="px-6 py-4 text-sm font-medium text-[#002D37]">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          user.role === "admin"
                            ? "bg-[#002D37] text-white"
                            : "bg-[#E0F2FE] text-[#0369A1]"
                        }`}
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-sm text-[#002D37] hover:underline cursor-pointer mr-4"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="text-sm text-red-600 hover:underline cursor-pointer"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#002D37] mb-4">
              {modalMode === "create" ? "ユーザー新規登録" : "ユーザー編集"}
            </h3>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#002D37] mb-1">
                  名前
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[#002D37] focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37] transition"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#002D37] mb-1">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[#002D37] focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37] transition"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-[#002D37] mb-1">
                  役割
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[#002D37] focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37] transition"
                >
                  <option value="admin">管理者</option>
                  <option value="ca">CA</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-[#002D37] rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00c752] disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-[#002D37] mb-2">
              ユーザーの削除
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              <span className="font-medium text-[#002D37]">{deleteTarget.name}</span>
              {" "}を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-[#002D37] rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
              >
                {deleting ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
