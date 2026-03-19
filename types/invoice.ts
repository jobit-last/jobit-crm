export type InvoiceStatus = "draft" | "issued" | "paid";

export interface Invoice {
  id: string;
  company_id: string | null;
  candidate_id: string | null;
  amount: number;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  created_at: string;
  company?: { id: string; name: string } | null;
  candidate?: { id: string; name: string } | null;
}

export type InvoiceInsert = Omit<Invoice, "id" | "created_at" | "company" | "candidate">;
export type InvoiceUpdate = Partial<InvoiceInsert>;

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "未発行",
  issued: "発行済",
  paid: "入金済",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
};

export const INVOICE_STATUS_LIST: InvoiceStatus[] = ["draft", "issued", "paid"];

/** ¥1,000,000 形式にフォーマット */
export function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/** 請求書番号を生成（INV-YYYYMMDD-XXXX） */
export function invoiceNumber(invoice: Pick<Invoice, "id" | "invoice_date">): string {
  const date = invoice.invoice_date.replace(/-/g, "").slice(0, 8);
  const suffix = invoice.id.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `INV-${date}-${suffix}`;
}
