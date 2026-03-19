export type ScheduleType = "meeting" | "interview";

export interface Schedule {
  id: string;
  type: ScheduleType;
  candidate_id: string | null;
  user_id: string | null;
  title: string;
  scheduled_at: string;
  duration_minutes: number | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  candidate?: { id: string; name: string } | null;
}

export type ScheduleInsert = Omit<Schedule, "id" | "created_at" | "candidate">;
export type ScheduleUpdate = Partial<ScheduleInsert>;

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  meeting: "面談",
  interview: "面接",
};

export const SCHEDULE_TYPE_COLORS: Record<ScheduleType, string> = {
  meeting: "bg-teal-100 text-teal-700",
  interview: "bg-indigo-100 text-indigo-700",
};

export const SCHEDULE_TYPE_BAR_COLORS: Record<ScheduleType, string> = {
  meeting: "bg-teal-500",
  interview: "bg-indigo-500",
};

export const SCHEDULE_TYPE_BG: Record<ScheduleType, string> = {
  meeting: "#CCFBF1",
  interview: "#E0E7FF",
};
