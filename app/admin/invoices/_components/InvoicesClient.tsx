"use client";

import { useState } from "react";
import Link from "next/link";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  formatAmount,
  invoiceNumber,
} from "@/types/invoice";

interface Props {
  initialInvoices: Invoice[];
}

const FILTERS: ("all" | InvoiceStatus)[] = ["all", "draft", "issued", "paid"];

export default function InvoicesClient({ initialInvoices }: Props) {
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");

  const filtered =
    statusFilter === "all"
      ? initialInvoices
      : initialInvoices.filter((inv) => inv.status === statusFilter);

  // Summary counts
  const counts = {
    all: initialInvoices.length,
    draft: initialInvoices.filter((i) => i.status === "draft").length,
    issued: initialInvoices.filter((i) => i.status === "issued").length,
    paid: initialInvoices.filter((i) => i.status === "paid").length,
  };

  // Total amounts
  const totalIssued = initialInvoices
    .filter((i) => i.status === "issued")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = initialInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#1A1A2E" }}>
          請求書管理
        </h1>
        <Link
          href="/admin/invoices/new"
          className="px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#002D37" }}
        >
          + 請求書作成
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <SummaryCard
          label="全件"
          value={`${counts.all}件`}
          sub={null}
        />
        <SummaryCard
          label="未発行"
          value={`${counts.draft}件`}
          sub={null}
          color="#6B7280"
        />
        <SummaryCard
          label="発行済（未入金）"
          value={`${counts.issued}件`}
          sub={totalIssued > 0 ? formatAmount(totalIssued) : null}
          color="#1D4ED8"
        />
        <SummaryCard
          label="入金済"
          value={`${counts.paid}件`}
          sub={totalPaid > 0 ? formatAmount(totalPaid) : null}
          color="#15803D"
        />
      </div>

      {/* Status filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex gap-1 px-4 pt-4 pb-0 border-b border-gray-200">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                statusFilter === f
                  ? "border-[#002D37]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              style={statusFilter === f ? { color: "#002D37" } : {}}
            >
              {f === "all" ? "すべて" : INVOICE_STATUS_LABELS[f]}
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor:
                    statusFilter === f ? "#002D37" : "#F3F4F6",
                  color: statusFilter === f ? "white" : "#6B7280",
                }}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-sm text-center py-16" style={{ color: "#9CA3AF" }}>
            該当する請求書がありません
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["請求書番号", "請求先", "求職者", "金額", "請求日", "支払期限", "ステータス"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium"
                        style={{ color: "#6B7280" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const isOverdue =
                    inv.status !== "paid" &&
                    new Date(inv.due_date) < new Date();
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors"
                      onClick={() =>
                        (window.location.href = `/admin/invoices/${inv.id}`)
                      }
                    >
                      <td className="px-4 py-3">
                        <span
                          className="text-sm font-mono font-medium"
                          style={{ color: "#00A0B0" }}
                        >
                          {invoiceNumber(inv)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#1A1A2E" }}>
                        {inv.company?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#1A1A2E" }}>
                        {inv.candidate?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: "#1A1A2E" }}>
                        {formatAmount(inv.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#6B7280" }}>
                        {new Date(inv.invoice_date).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          style={{
                            color: isOverdue ? "#DC2626" : "#6B7280",
                            fontWeight: isOverdue ? 600 : 400,
                          }}
                        >
                          {new Date(inv.due_date).toLocaleDateString("ja-JP")}
                          {isOverdue && " ⚠"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[inv.status]}`}
                        >
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  color = "#1A1A2E",
}: {
  label: string;
  value: string;
  sub: string | null;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
      <p className="text-xs" style={{ color: "#6B7280" }}>
        {label}
      </p>
      <p className="text-xl font-semibold mt-1" style={{ color }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
