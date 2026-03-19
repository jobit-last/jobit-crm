"use client";

import type { Schedule } from "@/types/schedule";
import { SCHEDULE_TYPE_BAR_COLORS, SCHEDULE_TYPE_BG } from "@/types/schedule";

interface Props {
  currentDate: Date;
  schedules: Schedule[];
  onAddClick: (datetime: string) => void;
  onEditClick: (schedule: Schedule) => void;
}

export default function MonthCalendar({
  currentDate,
  schedules,
  onAddClick,
  onEditClick,
}: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-start: offset = (getDay() + 6) % 7  (0=Mon ... 6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  while (days.length % 7 !== 0) days.push(null);

  const todayStr = new Date().toDateString();
  const weekLabels = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <div>
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekLabels.map((label, i) => (
          <div
            key={label}
            className={`py-2 text-center text-xs font-medium ${
              i >= 5 ? "text-red-400" : "text-gray-500"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="border-r border-b border-gray-100 min-h-[110px] bg-gray-50/40"
              />
            );
          }

          const dayStr = day.toDateString();
          const isToday = dayStr === todayStr;
          const daySchedules = schedules.filter(
            (s) => new Date(s.scheduled_at).toDateString() === dayStr
          );
          const colIdx = idx % 7;
          const isWeekend = colIdx >= 5;

          const datetimeStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day.getDate()
          ).padStart(2, "0")}T09:00`;

          return (
            <div
              key={dayStr}
              className={`border-r border-b border-gray-100 min-h-[110px] p-1 cursor-pointer transition-colors hover:bg-blue-50/30 ${
                colIdx === 6 ? "border-r-0" : ""
              }`}
              onClick={() => onAddClick(datetimeStr)}
            >
              <div
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1 ${
                  isToday
                    ? "text-white font-bold"
                    : isWeekend
                    ? "text-red-400"
                    : "text-gray-700"
                }`}
                style={isToday ? { backgroundColor: "#00A0B0" } : {}}
              >
                {day.getDate()}
              </div>

              <div className="space-y-0.5">
                {daySchedules.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(s);
                    }}
                    className="flex items-center gap-1 px-1 py-0.5 rounded text-xs cursor-pointer hover:opacity-80 truncate"
                    style={{ backgroundColor: SCHEDULE_TYPE_BG[s.type] }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SCHEDULE_TYPE_BAR_COLORS[s.type]}`}
                    />
                    <span className="truncate" style={{ color: "#1A1A2E" }}>
                      {new Date(s.scheduled_at).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {s.title}
                    </span>
                  </div>
                ))}
                {daySchedules.length > 3 && (
                  <div className="text-xs text-gray-400 px-1">
                    +{daySchedules.length - 3} 件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
