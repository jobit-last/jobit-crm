import { createClient } from "@/lib/supabase/server";
import type { Schedule } from "@/types/schedule";
import ScheduleClient from "./_components/ScheduleClient";

export default async function SchedulePage() {
  const supabase = await createClient();

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const [{ data: schedules }, { data: candidates }] = await Promise.all([
    supabase
      .from("schedules")
      .select("*, candidate:candidates(id, name)")
      .gte("scheduled_at", from)
      .lt("scheduled_at", to)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("candidates")
      .select("id, name")
      .eq("is_deleted", false)
      .order("name", { ascending: true }),
  ]);

  return (
    <ScheduleClient
      initialSchedules={(schedules as Schedule[]) ?? []}
      initialYear={now.getFullYear()}
      initialMonth={now.getMonth()}
      candidates={candidates ?? []}
    />
  );
}
