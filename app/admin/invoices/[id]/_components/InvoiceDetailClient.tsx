"use client";

import { useState } from "react";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LIST,
  formatAmount,
  invoiceNumber,
} from "@/types/invoice";

interface Props {
  invoice: Invoice;
}

export default function InvoiceDetailClient({ invoice: initial }: Props) {
  const [invoice, setInvoice] = useState<Invoice>(initial);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>(
    initial.status
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfMsg, setPdfMsg] = useState(false);

  const hasChanged = selectedStatus !== invoice.status;

  async function handleStatusSave() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selectedStatus }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    setInvoice(json.data as Invoice);
  }

  const isOverdue =
    invoice.status !== "paid" && new Date(invoice.due_date) < new Date();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Invoice preview — left 2/3 */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Invoice header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#002D37" }}>
                請求書
              </h2>
              <p className="mt-1 font-mono text-sm" style={{ color: "#002D37" }}>
                {invoiceNumber(invoice)}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${INVOICE_STATUS_COLORS[invoice.status]}`}
            >
              {INVOICE_STATUS_LABELS[invoice.status]}
            </span>
          </div>

          {/* Company & Candidate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: "#9CA3AF" }}
              >
                請求先
              </p>
              <p className="text-base font-semibold" style={{ color: "#002D37" }}>
                {invoice.company?.name ?? "—"}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: "#9CA3AF" }}
              >
                対象求職者
              </p>
              <p className="text-base font-semibold" style={{ color: "#002D37" }}>
                {invoice.candidate?.name ?? "—"}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: "#9CA3AF" }}
              >
                請求日
              </p>
              <p className="text-sm" style={{ color: "#002D37" }}>
                {new Date(invoice.invoice_date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: "#9CA3AF" }}
              >
                支払期限
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: isOverdue ? "#DC2626" : "#002D37" }}
              >
                {new Date(invoice.due_date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {isOverdue && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                    期限超過
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Amount table */}
          <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#F9FAFB" }}>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-medium"
                    style={{ color: "#6B7280" }}
                  >
                    摘要
                  </th>
                  <th
                    className="px-4 py-2.5 text-right text-xs font-medium"
                    style={{ color: "#6B7280" }}
                  >
                    金額
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#002D37" }}
                  >
                    人材紹介成功報酬
                    {invoice.candidate?.name && ` — ${invoice.candidate.name}`}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right font-medium"
                    style={{ color: "#002D37" }}
                  >
                    {formatAmount(invoice.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr
                  className="border-t-2 border-gray-200"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <td
                    className="px-4 py-3 text-sm font-semibold"
                    style={{ color: "#002D37" }}
                  >
                    合計金額
                  </td>
                  <td
                    className="px-4 py-3 text-right text-lg font-bold"
                    style={{ color: "#002D37" }}
                  >
                    {formatAmount(invoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-4 border-t border-gray-100">
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "#9CA3AF" }}
              >
                備考
              </p>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: "#374151" }}
              >
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Created at */}
          <p className="mt-6 text-xs text-right" style={{ color: "#9CA3AF" }}>
            作成日:{" "}
            {new Date(invoice.created_at).toLocaleDateString("ja-JP")}
          </p>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* PDF button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "#002D37" }}
          >
            操作
          </h3>
          <button
            onClick={() => {
              setPdfMsg(true);
              setTimeout(() => setPdfMsg(false), 3000);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            PDF出力
          </button>
          {pdfMsg && (
            <p
              className="mt-2 text-xs text-center"
              style={{ color: "#F59E0B" }}
            >
              PDF出力機能は準備中です
            </p>
          )}
        </div>

        {/* Status management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "#002D37" }}
          >
            ステータス管理
          </h3>

          <p className="text-xs mb-2" style={{ color: "#6B7280" }}>
            現在のステータス
          </p>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${INVOICE_STATUS_COLORS[invoice.status]}`}
          >
            {INVOICE_STATUS_LABELS[invoice.status]}
          </span>

          <p className="text-xs mb-2" style={{ color: "#6B7280" }}>
            変更先
          </p>
          <div className="space-y-2 mb-3">
            {INVOICE_STATUS_LIST.map((s) => (
              <label
                key={s}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                  selectedStatus === s
                    ? "border-[#002D37] bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={selectedStatus === s}
                  onChange={() => setSelectedStatus(s)}
                  className="accent-[#002D37]"
                />
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[s]}`}
                >
                  {INVOICE_STATUS_LABELS[s]}
                </span>
              </label>
            ))}
          </div>

          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

          <button
            onClick={handleStatusSave}
            disabled={!hasChanged || saving}
            className="w-full py-2 rounded-md text-sm font-medium text-[#002D37] bg-[#00E05D] transition-colors hover:bg-[#00A645] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "保存中..." : "変更する"}
          </button>
        </div>

        {/* Meta info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "#002D37" }}
          >
            請求情報
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-xs" style={{ color: "#6B7280" }}>
                請求金額
              </dt>
              <dd className="text-sm font-semibold" style={{ color: "#002D37" }}>
                {formatAmount(invoice.amount)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs" style={{ color: "#6B7280" }}>
                請求日
              </dt>
              <dd className="text-sm" style={{ color: "#002D37" }}>
                {new Date(invoice.invoice_date).toLocaleDateString("ja-JP")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs" style={{ color: "#6B7280" }}>
                支払期限
              </dt>
              <dd
                className="text-sm"
                style={{ color: isOverdue ? "#DC2626" : "#002D37" }}
              >
                {new Date(invoice.due_date).toLocaleDateString("ja-JP")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
