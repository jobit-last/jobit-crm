import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/types/invoice";
import InvoicesClient from "./_components/InvoicesClient";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select("*, company:companies(id, name), candidate:candidates(id, name)")
    .order("invoice_date", { ascending: false });

  return <InvoicesClient initialInvoices={(data as Invoice[]) ?? []} />;
}
