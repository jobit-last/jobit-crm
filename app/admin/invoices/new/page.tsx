import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import InvoiceForm from "./_components/InvoiceForm";

export default async function NewInvoicePage() {
  const supabase = await createClient();

  const [{ data: companies }, { data: candidates }] = await Promise.all([
    supabase.from("companies").select("id, name").order("name", { ascending: true }),
    supabase
      .from("candidates")
      .select("id, name")
      .eq("is_deleted", false)
      .order("name", { ascending: true }),
  ]);

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/invoices" className="hover:underline" style={{ color: "#00A0B0" }}>
          請求書管理
        </Link>
        <span>/</span>
        <span style={{ color: "#1A1A2E" }}>新規作成</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#1A1A2E" }}>
        請求書作成
      </h1>

      <div className="max-w-2xl">
        <InvoiceForm companies={companies ?? []} candidates={candidates ?? []} />
      </div>
    </div>
  );
}
