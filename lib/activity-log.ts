import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { LogAction } from "@/types/activity-log";

export async function recordLog(action: LogAction, target: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip_address = forwarded?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? null;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action,
    target,
    ip_address,
  });
}
