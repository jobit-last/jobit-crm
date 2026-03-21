"use client";

import { useState } from "react";
import type { Schedule } from "@/types/schedule";
import type { Interview } from "@/types/interview";
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_COLORS,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_RESULT_COLORS,
} from "@/types/interview";
import { SCHEDULE_TYPE_LABELS } from "@/types/schedule";

interface CalendarEvent {
  id: string;
  type: "schedule" | "interview";
  title: string;
  datetime: string;
  location: string | null;
  badge: { label: string; cls: string };
  resultBadge?: { label: string; cls: string } | null;
}

interface Props {
  schedules: Schedule[];
  interviews: (Interview & { application?: { job?: { title?: string; company?: { name?: string } | null } | null } | null })[];
}

const DAY_NAMES = ["月", "火", "水", "木", "金", "土", "日"];

// イベントタイプに応じた左ボーダー色
function getEventBorderColor(ev: CalendarEvent): string {
  if (ev.type === "interview") return "#2394FF";
  return "#00B59A";
}

export default function ScheduleClient({ schedules, interviews }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  // イベント統合
  const events: CalendarEvent[] = [
    ...schedules.map((s) => ({
      id: s.id,
      type: "schedule" as const,
      title: s.title,
      datetime: s.scheduled_at,
      location: s.location,
      badge: {
        label: SCHEDULE_TYPE_LABELS[s.type],
        cls: s.type === "meeting" ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700",
      },
    })),
    ...interviews.map((iv) => ({
      id: iv.id,
      type: "interview" as const,
      title: iv.application?.job?.title
        ? `${iv.application.job.company?.name ?? ""} ${iv.application.job.title}`
        : "面接",
      datetime: iv.scheduled_at,
      location: iv.location,
      badge: {
        label: INTERVIEW_TYPE_LABELS[iv.interview_type],
        cls: INTERVIEW_TYPE_COLORS[iv.interview_type],
      },
      resultBadge: iv.result
        ? { label: INTERVIEW_RESULT_LABELS[iv.result], cls: INTERVIEW_RESULT_COLORS[iv.result] }
        : null,
    })),
  ].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  // カレンダーグリッド生成
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // 月曜始まり
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function getEventsForDay(day: number): CalendarEvent[] {
    return events.filter((e) => {
      const d = new Date(e.datetime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }

  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  // 今後の予定
  const upcoming = events.filter((e) => new Date(e.datetime) >= now);

  return (
    <div className="space-y-6">
      {/* カレンダー */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 text-sm font-medium rounded-xl transition-all hover:shadow-sm"
            style={{ color: "#2394FF", border: "1px solid #2394FF" }}
          >
            ←
          </button>
          <h2 className="text-base font-bold" style={{ color: "#21242B" }}>
            {year}年{month + 1}月
          </h2>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 text-sm font-medium rounded-xl transition-all hover:shadow-sm"
            style={{ color: "#2394FF", border: "1px solid #2394FF" }}
          >
            →
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold py-1" style={{ color: "#16B1F3" }}>
              {d}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="h-20 border border-gray-50" />;
            const dayEvents = getEventsForDay(day);
            const isToday = `${year}-${month}-${day}` === todayStr;
            return (
              <div
                key={i}
                className={`h-20 border border-gray-50 p-1 rounded-lg ${isToday ? "ring-2 ring-[#2394FF] ring-inset" : ""}`}
                style={{ backgroundColor: isToday ? "#EBF5FF" : undefined }}
              >
                <p
                  className={`text-[11px] mb-0.5 ${
                    isToday
                      ? "font-bold"
                      : "text-gray-500"
                  }`}
                  style={isToday ? { color: "#2394FF" } : undefined}
                >
                  {isToday ? (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                      style={{ backgroundColor: "#2394FF" }}
                    >
                      {day}
                    </span>
                  ) : (
                    day
                  )}
                </p>
                {dayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="text-[9px] truncate rounded px-1 py-0.5 mb-0.5"
                    style={{
                      backgroundColor: ev.type === "interview" ? "#EBF5FF" : "#F0FDFA",
                      color: ev.type === "interview" ? "#2394FF" : "#00B59A",
                    }}
                  >
                    {new Date(ev.datetime).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {ev.title.slice(0, 8)}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[9px] text-gray-400 text-center">
                    +{dayEvents.length - 2}件
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 今後の予定リスト */}
      <section>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#16B1F3" }}>
          今後の予定（{upcoming.length}件）
        </h2>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-gray-400">今後の予定はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl shadow-sm p-4 border-l-4 hover:shadow-md transition-all"
                style={{ borderLeftColor: getEventBorderColor(ev) }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${ev.badge.cls}`}
                      >
                        {ev.badge.label}
                      </span>
                      {ev.resultBadge && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${ev.resultBadge.cls}`}
                        >
                          {ev.resultBadge.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: "#21242B" }}>
                      {ev.title}
                    </p>
                    {ev.location && (
                      <p className="text-xs text-gray-500 mt-0.5">場所: {ev.location}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold" style={{ color: "#2394FF" }}>
                      {new Date(ev.datetime).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs" style={{ color: "#2394FF" }}>
                      {new Date(ev.datetime).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
