import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/notification";
import NotificationClient from "./_components/NotificationClient";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const [{ data: notifications }, { data: candidates }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*, candidate:candidates(id, name)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("candidates")
      .select("id, name")
      .eq("is_deleted", false)
      .order("name", { ascending: true }),
  ]);

  return (
    <NotificationClient
      initialNotifications={(notifications as Notification[]) ?? []}
      candidates={candidates ?? []}
    />
  );
}
