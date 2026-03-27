import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Invoice } from "@/types/invoice";
import { invoiceNumber } from "@/types/invoice";
import InvoiceDetailClient from "./_components/InvoiceDetailClient";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*, company:companies(id, name), candidate:candidates(id, name)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const invoice = data as Invoice;

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link
          href="/admin/invoices"
          className="hover:underline"
          style={{ color: "#002D37" }}
        >
          請求書管理
        </Link>
        <span>/</span>
        <span style={{ color: "#002D37" }}>{invoiceNumber(invoice)}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#002D37" }}>
          {invoiceNumber(invoice)}
        </h1>
      </div>

      <InvoiceDetailClient invoice={invoice} />
    </div>
  );
}
