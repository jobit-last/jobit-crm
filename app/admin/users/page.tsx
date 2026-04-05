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
  admin: "ç®¡çè",
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
      if (!res.ok) throw new Error("ã¦ã¼ã¶ã¼ä¸è¦§ã®åå¾ã«å¤±æãã¾ãã");
      const json = await res.json();
      setUsers(json.data ?? json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ã¨ã©ã¼ãçºçãã¾ãã");
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
        throw new Error(data.message || data.error || "ä¿å­ã«å¤±æãã¾ãã");
      }

      closeModal();

      // LDã¢ã«ã¦ã³ããä½æãããå ´åãèªè¨¼æå ±ãã¤ã¢ã­ã°ãè¡¨ç¤º
      if (data.ld_login_id) {
        setLdCredentials({
          email: form.email,
          loginId: data.ld_login_id,
        });
      }

      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ã¨ã©ã¼ãçºçãã¾ãã");
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
        throw new Error(data.error || "åé¤ã«å¤±æãã¾ãã");
      }
      setDeleteTarget(null);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ã¨ã©ã¼ãçºçãã¾ãã");
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
              ããã·ã¥ãã¼ã
            </a>
            <a href="/admin/users" className="text-white font-medium">
              ã¦ã¼ã¶ã¼ç®¡ç
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#002D37]">LDã¦ã¼ã¶ã¼ç®¡ç</h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00A645] transition cursor-pointer"
          >
            + æ°è¦ç»é²
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
            <div className="px-6 py-12 text-center text-[#6B7280]">èª­ã¿è¾¼ã¿ä¸­...</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#6B7280]">
              ã¦ã¼ã¶ã¼ãç»é²ããã¦ãã¾ãã
            </div>
          ) : (
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    ã­ã°ã¤ã³ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    åå
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    ã¡ã¼ã«
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    å½¹å²
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    ç»é²æ¥
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    æä½
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-[#002D37]">
                      {user.ld_login_id ?? (
                        <span className="text-gray-300">â</span>
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
                        ç·¨é
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="text-sm text-red-600 hover:underline cursor-pointer"
                      >
                        åé¤
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
              {modalMode === "create" ? "ã¦ã¼ã¶ã¼æ°è¦ç»é²" : "ã¦ã¼ã¶ã¼ç·¨é"}
            </h3>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#002D37] mb-1">
                  åå <span className="text-red-500">*</span>
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
                  ã¡ã¼ã«ã¢ãã¬ã¹ <span className="text-red-500">*</span>
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
                  å½¹å²
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[#002D37] focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37] transition"
                >
                  <option value="admin">ç®¡çè</option>
                  <option value="ca">CA</option>
                </select>
              </div>

              <div>
                <label htmlFor="ld_login_id" className="block text-sm font-medium text-[#002D37] mb-1">
                  ã­ã°ã¤ã³ID
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
                  {modalMode === "create" ? "ç©ºæ¬ã®å ´åãä¸ã®ãã§ãã¯ã§èªåçæã§ãã¾ã" : "ã­ã°ã¤ã³IDãç´æ¥ç·¨éã§ãã¾ã"}
                </p>
              </div>

              {/* LDã¢ã«ã¦ã³ãä½æãã§ãã¯ï¼æ°è¦ä½ææã®ã¿ï¼ */}
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
                      Jobit CRM ã­ã°ã¤ã³ã¢ã«ã¦ã³ããåæã«ä½æãã
                    </span>
                  </label>
                  {form.create_ld_account && (
                    <p className="mt-2 text-xs text-[#6B7280]">
                      ç»é²å®äºå¾ã«ã­ã°ã¤ã³IDï¼LD-XXXXå½¢å¼ï¼ãèªåçæãããç»é¢ã«è¡¨ç¤ºããã¾ããã¡ã¼ã«ã¢ãã¬ã¹ã¨ã­ã°ã¤ã³IDãã¦ã¼ã¶ã¼ã«ãä¼ããã ããã
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
                  ã­ã£ã³ã»ã«
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00A645] disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? <><Spinner size={16} className="inline mr-1.5" />ä¿å­ä¸­...</> : "ä¿å­"}
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
                LDã¢ã«ã¦ã³ããä½æãã¾ãã
              </h3>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 mb-4">
              <div>
                <p className="text-xs text-[#6B7280]">ã¡ã¼ã«ã¢ãã¬ã¹</p>
                <p className="text-sm font-medium text-[#002D37]">{ldCredentials.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">ã­ã°ã¤ã³IDï¼åæãã¹ã¯ã¼ãï¼</p>
                <p className="text-xl font-bold font-mono text-[#002D37]">{ldCredentials.loginId}</p>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] mb-4">
              ãã®æå ±ãã¦ã¼ã¶ã¼ã«ãä¼ããã ãããã­ã°ã¤ã³IDã¯åæãã¹ã¯ã¼ãã¨ãã¦ãä½¿ç¨ããã¾ãããã®ç»é¢ãéããã¨åè¡¨ç¤ºã§ãã¾ããã
            </p>

            <button
              onClick={() => setLdCredentials(null)}
              className="w-full px-4 py-3 bg-[#002D37] text-white font-semibold rounded-lg hover:bg-[#003D4A] transition cursor-pointer"
            >
              ç¢ºèªãã¾ãã
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
              ã¦ã¼ã¶ã¼ã®åé¤
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              <span className="font-medium text-[#002D37]">{deleteTarget.name}</span>
              {" "}ãåé¤ãã¾ããï¼ãã®æä½ã¯åãæ¶ãã¾ããã
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-[#002D37] rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                ã­ã£ã³ã»ã«
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
              >
                {deleting ? <><Spinner size={16} className="inline mr-1.5" />åé¤ä¸­...</> : "åé¤"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
