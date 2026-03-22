"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { Memorandum, ContractStatus } from "@/types/contract";
import Spinner from "@/components/Spinner";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "draft", label: "下書き" },
  { value: "active", label: "有効" },
  { value: "expired", label: "期限切れ" },
];

export default function MemorandumsPage() {
  const [memorandums, setMemorandums] = useState<Memorandum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_id: "", contract_id: "", title: "", content: "",
    status: "draft" as ContractStatus, signed_date: "", file_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Memorandum | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMemorandums = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (titleFilter) params.set("title", titleFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/memorandums?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setMemorandums(json.data);
      setTotalCount(json.meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [page, titleFilter, statusFilter]);

  useEffect(() => { fetchMemorandums(); }, [fetchMemorandums]);

  function openCreate() {
    setForm({ company_id: "", contract_id: "", title: "", content: "", status: "draft", signed_date: "", file_url: "" });
    setEditingId(null);
    setModalOpen(true);
    setError("");
  }

  function openEdit(m: Memorandum) {
    setForm({
      company_id: m.company_id ?? "", contract_id: m.contract_id ?? "",
      title: m.title, content: m.content ?? "", status: m.status,
      signed_date: m.signed_date ?? "", file_url: m.file_url ?? "",
    });
    setEditingId(m.id);
    setModalOpen(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const url = editingId ? `/api/memorandums/${editingId}` : "/api/memorandums";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setModalOpen(false);
      await fetchMemorandums();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/memorandums/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDeleteTarget(null);
      await fetchMemorandums();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(d: string | null) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ja-JP");
  }

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#002D37]">覚書管理</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00A645] transition cursor-pointer">
          + 新規登録
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-[#6B7280] mb-1">タイトル</label>
          <input type="text" value={titleFilter} onChange={(e) => { setTitleFilter(e.target.value); setPage(1); }}
            placeholder="検索..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1">ステータス</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && !modalOpen && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-[#6B7280]">読み込み中...</div>
        ) : memorandums.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#6B7280]">覚書が登録されていません</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">企業名</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">タイトル</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">ステータス</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">締結日</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {memorandums.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-[#002D37]">{m.company_name ?? "-"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#002D37]">
                    <Link href={`/admin/memorandums/${m.id}`} className="hover:underline">{m.title}</Link>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{formatDate(m.signed_date)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(m)} className="text-sm text-[#002D37] hover:underline cursor-pointer mr-4">編集</button>
                    <button onClick={() => setDeleteTarget(m)} className="text-sm text-red-600 hover:underline cursor-pointer">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-[#6B7280]">全 {totalCount} 件</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">前へ</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">次へ</button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#002D37] mb-4">
              {editingId ? "覚書編集" : "覚書新規登録"}
            </h3>
            {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#002D37] mb-1">タイトル *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#002D37] mb-1">企業ID</label>
                <input type="text" value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                  placeholder="企業のUUIDを入力" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#002D37] mb-1">契約書ID</label>
                <input type="text" value={form.contract_id} onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
                  placeholder="紐づく契約書のUUID（任意）" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#002D37] mb-1">ステータス</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ContractStatus })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]">
                  <option value="draft">下書き</option>
                  <option value="active">有効</option>
                  <option value="expired">期限切れ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#002D37] mb-1">締結日</label>
                <input type="date" value={form.signed_date} onChange={(e) => setForm({ ...form, signed_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#002D37] mb-1">内容</label>
                <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37] resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#002D37] mb-1">ファイルURL</label>
                <input type="url" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37]/20 focus:border-[#002D37]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-[#002D37] rounded-lg hover:bg-gray-50 transition cursor-pointer">キャンセル</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-[#00E05D] text-[#002D37] font-semibold rounded-lg hover:bg-[#00A645] disabled:opacity-50 transition cursor-pointer">
                  {submitting ? <><Spinner size={16} className="inline mr-1.5" />保存中...</> : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-[#002D37] mb-2">覚書の削除</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              <span className="font-medium text-[#002D37]">{deleteTarget.title}</span> を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-[#002D37] rounded-lg hover:bg-gray-50 transition cursor-pointer">キャンセル</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition cursor-pointer">
                {deleting ? <><Spinner size={16} className="inline mr-1.5" />削除中...</> : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
