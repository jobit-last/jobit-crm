"use client";

import { useState, useEffect, useCallback } from "react";
import type { User, UserRole } from "@/types/user";
import Spinner from "@/components/Spinner";

type ModalMode = "create" | "edit";

interface FormData {
  name: string;
  email: string;
  role: UserRole;
  ld_login_id: string;
  create_ld_account: boolean;
}

const INITIAL_FORM: FormData = { name: "", email: "", role: "ca", ld_login_id: "", create_ld_account: false };

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  ca: "CA",
};

interface LdCredentials {
  email: string;
  loginId: string;
}

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

  // LD credentials dialog
  const [ldCredentials, setLdCredentials] = useState<LdCredentials | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("ユーザー一覧の取得に失敗しました");
      const json = await res.json();
      setUsers(json.data ?? json);
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
    setForm({ name: user.name, email: user.email, role: user.role, ld_login_id: user.ld_login_id || "", create_ld_account: false });
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

      const { create_ld_account, ...rest } = form;
      const payload = modalMode === "create"
        ? { ...rest, create_ld_account }
        : rest;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "保存に失敗しました");
      }

      closeModal();

      // LDアカウントが作成された場合、認証情報ダイアログを表示
      if (data.ld_login_id) {
        setLdCredentials({
          email: form.email,
          loginId: data.ld_login_id,
        });
      }

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
          <h2 className="text-2xl font-bold text-[#002D37]">LDユーザー管理</h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00A645] transition cursor-pointer"
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
            <table className="w-full min-w-[720px]">
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
                    <td className="px-6 py-4 text-sm font-mono text-[#002D37]">
                      {user.ld_login_id ?? (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
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
                  名前 <span className="text-red-500">*</span>
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
                  メールアドレス <span className="text-red-500">*</span>
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

              <div>
                <label htmlFor="ld_login_id" className="block text-sm font-medium text-[#002D37] mb-1">
                  ログインID
                </label>
                <input
                  id="ld_login_id"
                  type="text"
                  value={form.ld_login_id}
                  onChange={(e) => setForm({ ...form, ld_login_id: e.target.value })}
                  placeholder="LD-XXXX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[#002D37] font-mono focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37] transition"
                />
                <p className="mt-1 text-xs text-[#6B7280]">
                  {modalMode === "create" ? "空欄の場合、下のチェックで自動生成できます" : "ログインIDを直接編集できます"}
                </p>
              </div>

              {/* LDアカウント作成チェック（新規作成時のみ） */}
              {modalMode === "create" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.create_ld_account}
                      onChange={(e) => setForm({ ...form, create_ld_account: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-[#002D37]">
                      Jobit CRM ログインアカウントを同時に作成する
                    </span>
                  </label>
                  {form.create_ld_account && (
                    <p className="mt-2 text-xs text-[#6B7280]">
                      登録完了後にログインID（LD-XXXX形式）が自動生成され、画面に表示されます。メールアドレスとログインIDをユーザーにお伝えください。
                    </p>
                  )}
                </div>
              )}

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
                  className="flex-1 px-4 py-2.5 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00A645] disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? <><Spinner size={16} className="inline mr-1.5" />保存中...</> : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LD Credentials Dialog */}
      {ldCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 text-2xl mb-2">
                &#10003;
              </span>
              <h3 className="text-lg font-semibold text-[#002D37]">
                LDアカウントを作成しました
              </h3>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 mb-4">
              <div>
                <p className="text-xs text-[#6B7280]">メールアドレス</p>
                <p className="text-sm font-medium text-[#002D37]">{ldCredentials.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">ログインID（初期パスワード）</p>
                <p className="text-xl font-bold font-mono text-[#002D37]">{ldCredentials.loginId}</p>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] mb-4">
              この情報をユーザーにお伝えください。ログインIDは初期パスワードとしても使用されます。この画面を閉じると再表示できません。
            </p>

            <button
              onClick={() => setLdCredentials(null)}
              className="w-full px-4 py-3 bg-[#002D37] text-white font-semibold rounded-lg hover:bg-[#003D4A] transition cursor-pointer"
            >
              確認しました
            </button>
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
                {deleting ? <><Spinner size={16} className="inline mr-1.5" />削除中...</> : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
