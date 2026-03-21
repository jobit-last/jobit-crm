"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InvoiceStatus } from "@/types/invoice";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_LIST } from "@/types/invoice";

interface Props {
  companies: { id: string; name: string }[];
  candidates: { id: string; name: string }[];
}

export default function InvoiceForm({ companies, candidates }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    company_id: "",
    candidate_id: "",
    amount: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    status: "draft" as InvoiceStatus,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Auto-set due_date to 30 days after invoice_date
  function handleInvoiceDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const due = new Date(value);
    due.setDate(due.getDate() + 30);
    setForm((prev) => ({
      ...prev,
      invoice_date: value,
      due_date: prev.due_date || due.toISOString().slice(0, 10),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: form.company_id || null,
        candidate_id: form.candidate_id || null,
        amount: Number(form.amount),
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        status: form.status,
        notes: form.notes || null,
      }),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    router.push(`/admin/invoices/${json.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "#002D37" }}>
          基本情報
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 請求先会社 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              請求先会社
            </label>
            <select
              name="company_id"
              value={form.company_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">選択なし</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 求職者 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              求職者
            </label>
            <select
              name="candidate_id"
              value={form.candidate_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">選択なし</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              請求金額（円） <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ¥
              </span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min={1}
                placeholder="500000"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>
            {form.amount && (
              <p className="mt-1 text-xs" style={{ color: "#002D37" }}>
                ¥{Number(form.amount).toLocaleString("ja-JP")}
              </p>
            )}
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ステータス
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              {INVOICE_STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {INVOICE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* 請求日 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              請求日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="invoice_date"
              value={form.invoice_date}
              onChange={handleInvoiceDateChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>

          {/* 支払期限 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              支払期限 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "#002D37" }}>
          備考
        </h2>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="備考・特記事項を入力..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <a
          href="/admin/invoices"
          className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </a>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 rounded-md text-sm font-medium text-[#002D37] bg-[#00E05D] transition-colors hover:bg-[#00A645] disabled:opacity-60"
        >
          {submitting ? "作成中..." : "請求書を作成"}
        </button>
      </div>
    </form>
  );
}
