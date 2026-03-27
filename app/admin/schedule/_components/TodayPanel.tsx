"use client";

import type { Schedule } from "@/types/schedule";
import { SCHEDULE_TYPE_LABELS, SCHEDULE_TYPE_COLORS } from "@/types/schedule";

interface Props {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
}

export default function TodayPanel({ schedules, onEdit }: Props) {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-sm font-semibold" style={{ color: "#002D37" }}>
          今日の予定
        </h2>
        <span className="text-xs" style={{ color: "#6B7280" }}>
          {dateLabel}
        </span>
        {schedules.length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: "#00E05D" }}
          >
            {schedules.length}件
          </span>
        )}
      </div>

      {schedules.length === 0 ? (
        <p className="text-sm text-gray-400">今日の予定はありません</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => onEdit(s)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
            >
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${SCHEDULE_TYPE_COLORS[s.type]}`}
              >
                {SCHEDULE_TYPE_LABELS[s.type]}
              </span>
              <div>
                <p className="text-xs font-medium" style={{ color: "#002D37" }}>
                  {new Date(s.scheduled_at).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  {s.title}
                </p>
                {s.candidate?.name && (
                  <p className="text-xs text-gray-500">{s.candidate.name}</p>
                )}
                {s.duration_minutes && (
                  <p className="text-xs text-gray-400">{s.duration_minutes}分</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
