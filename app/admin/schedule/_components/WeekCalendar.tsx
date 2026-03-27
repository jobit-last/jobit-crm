"use client";

import type { Schedule } from "@/types/schedule";
import { SCHEDULE_TYPE_BAR_COLORS, SCHEDULE_TYPE_BG, SCHEDULE_TYPE_LABELS } from "@/types/schedule";

interface Props {
  currentDate: Date;
  schedules: Schedule[];
  onAddClick: (datetime: string) => void;
  onEditClick: (schedule: Schedule) => void;
}

export default function WeekCalendar({
  currentDate,
  schedules,
  onAddClick,
  onEditClick,
}: Props) {
  // Get Monday of the week
  const day = currentDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }

  const todayStr = new Date().toDateString();
  const jpDays = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <div>
      {/* Header row */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((d, i) => {
          const isToday = d.toDateString() === todayStr;
          const isWeekend = i >= 5;
          return (
            <div
              key={i}
              className={`py-3 text-center border-r border-gray-100 ${
                i === 6 ? "border-r-0" : ""
              }`}
            >
              <div
                className={`text-xs font-medium ${
                  isWeekend ? "text-red-400" : "text-gray-500"
                }`}
              >
                {jpDays[i]}
              </div>
              <div
                className={`mt-1 mx-auto inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                  isToday
                    ? "text-white"
                    : isWeekend
                    ? "text-red-400"
                    : "text-gray-700"
                }`}
                style={isToday ? { backgroundColor: "#00E05D" } : {}}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule grid */}
      <div className="grid grid-cols-7 min-h-[420px]">
        {weekDays.map((d, i) => {
          const dayStr = d.toDateString();
          const daySchedules = schedules
            .filter((s) => new Date(s.scheduled_at).toDateString() === dayStr)
            .sort(
              (a, b) =>
                new Date(a.scheduled_at).getTime() -
                new Date(b.scheduled_at).getTime()
            );

          const datetimeStr = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T09:00`;

          return (
            <div
              key={i}
              className={`border-r border-gray-100 p-1.5 cursor-pointer hover:bg-blue-50/20 transition-colors ${
                i === 6 ? "border-r-0" : ""
              }`}
              onClick={() => onAddClick(datetimeStr)}
            >
              {daySchedules.map((s) => (
                <div
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(s);
                  }}
                  className="mb-1.5 p-2 rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: SCHEDULE_TYPE_BG[s.type] }}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SCHEDULE_TYPE_BAR_COLORS[s.type]}`}
                    />
                    <span className="text-xs font-medium" style={{ color: "#002D37" }}>
                      {new Date(s.scheduled_at).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "#002D37" }}
                  >
                    {s.title}
                  </p>
                  {s.candidate?.name && (
                    <p className="text-xs text-gray-500 truncate">
                      {s.candidate.name}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {SCHEDULE_TYPE_LABELS[s.type]}
                    </span>
                    {s.duration_minutes && (
                      <span className="text-xs text-gray-400">
                        {s.duration_minutes}分
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
