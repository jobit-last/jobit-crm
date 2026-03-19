"use client";

import { useState, useCallback } from "react";
import type { Schedule } from "@/types/schedule";
import MonthCalendar from "./MonthCalendar";
import WeekCalendar from "./WeekCalendar";
import TodayPanel from "./TodayPanel";
import ScheduleFormModal from "./ScheduleFormModal";

interface Props {
  initialSchedules: Schedule[];
  initialYear: number;
  initialMonth: number;
  candidates: { id: string; name: string }[];
}

export default function ScheduleClient({
  initialSchedules,
  initialYear,
  initialMonth,
  candidates,
}: Props) {
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(
    new Date(initialYear, initialMonth, 1)
  );
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [defaultDatetime, setDefaultDatetime] = useState("");

  const fetchSchedules = useCallback(
    async (date: Date, viewMode: "month" | "week") => {
      setLoading(true);
      let from: Date, to: Date;

      if (viewMode === "month") {
        from = new Date(date.getFullYear(), date.getMonth(), 1);
        to = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      } else {
        const d = date.getDay();
        const diff = d === 0 ? -6 : 1 - d;
        from = new Date(date);
        from.setDate(date.getDate() + diff);
        from.setHours(0, 0, 0, 0);
        to = new Date(from);
        to.setDate(from.getDate() + 7);
      }

      const res = await fetch(
        `/api/schedules?from=${from.toISOString()}&to=${to.toISOString()}`
      );
      const json = await res.json();
      setLoading(false);
      if (res.ok) setSchedules(json.data ?? []);
    },
    []
  );

  function navigate(dir: 1 | -1) {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === "month") {
        next.setMonth(prev.getMonth() + dir);
      } else {
        next.setDate(prev.getDate() + dir * 7);
      }
      fetchSchedules(next, view);
      return next;
    });
  }

  function goToday() {
    const today = new Date();
    setCurrentDate(today);
    fetchSchedules(today, view);
  }

  function switchView(newView: "month" | "week") {
    setView(newView);
    fetchSchedules(currentDate, newView);
  }

  function openAdd(datetime = "") {
    setEditingSchedule(null);
    setDefaultDatetime(datetime);
    setShowModal(true);
  }

  function openEdit(schedule: Schedule) {
    setEditingSchedule(schedule);
    setDefaultDatetime("");
    setShowModal(true);
  }

  function handleSave(saved: Schedule) {
    setSchedules((prev) => {
      if (editingSchedule) {
        return prev.map((s) => (s.id === saved.id ? saved : s));
      }
      return [...prev, saved].sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime()
      );
    });
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  // Period label
  const periodLabel =
    view === "month"
      ? `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
      : (() => {
          const d = currentDate.getDay();
          const diff = d === 0 ? -6 : 1 - d;
          const mon = new Date(currentDate);
          mon.setDate(currentDate.getDate() + diff);
          const sun = new Date(mon);
          sun.setDate(mon.getDate() + 6);
          return `${mon.getFullYear()}年${mon.getMonth() + 1}月${mon.getDate()}日 〜 ${sun.getMonth() + 1}月${sun.getDate()}日`;
        })();

  // Today's schedules (from all currently loaded data)
  const todayStr = new Date().toDateString();
  const todaySchedules = schedules.filter(
    (s) => new Date(s.scheduled_at).toDateString() === todayStr
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold" style={{ color: "#1A1A2E" }}>
          スケジュール管理
        </h1>
        <button
          onClick={() => openAdd()}
          className="px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#002D37" }}
        >
          + スケジュール追加
        </button>
      </div>

      {/* Today's agenda */}
      <TodayPanel schedules={todaySchedules} onEdit={openEdit} />

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
            >
              ‹
            </button>
            <span
              className="text-base font-semibold min-w-[220px] text-center"
              style={{ color: "#1A1A2E" }}
            >
              {loading ? "読み込み中..." : periodLabel}
            </span>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
            >
              ›
            </button>
            <button
              onClick={goToday}
              className="ml-2 px-3 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              今日
            </button>
          </div>

          {/* View toggle */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => switchView("month")}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                view === "month"
                  ? { backgroundColor: "#002D37", color: "white" }
                  : { color: "#6B7280" }
              }
            >
              月表示
            </button>
            <button
              onClick={() => switchView("week")}
              className="px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-300"
              style={
                view === "week"
                  ? { backgroundColor: "#002D37", color: "white" }
                  : { color: "#6B7280" }
              }
            >
              週表示
            </button>
          </div>
        </div>

        {view === "month" ? (
          <MonthCalendar
            currentDate={currentDate}
            schedules={schedules}
            onAddClick={openAdd}
            onEditClick={openEdit}
          />
        ) : (
          <WeekCalendar
            currentDate={currentDate}
            schedules={schedules}
            onAddClick={openAdd}
            onEditClick={openEdit}
          />
        )}
      </div>

      {showModal && (
        <ScheduleFormModal
          schedule={editingSchedule}
          defaultDatetime={defaultDatetime}
          candidates={candidates}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
