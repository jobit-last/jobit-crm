"use client";

import { useState } from "react";
import type { Notification, NotificationType } from "@/types/notification";
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_STATUS_COLORS,
} from "@/types/notification";

interface Props {
  notifications: Notification[];
}

const TYPE_FILTERS: ("all" | NotificationType)[] = ["all", "LINE", "SMS", "email"];

export default function HistoryList({ notifications }: Props) {
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    typeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === typeFilter);

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "#002D37" }}>
          送信履歴
        </h2>
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          {filtered.length}件
        </span>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={
              typeFilter === f
                ? { backgroundColor: "#002D37", color: "white" }
                : { backgroundColor: "#F3F4F6", color: "#6B7280" }
            }
          >
            {f === "all" ? "すべて" : NOTIFICATION_TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-center py-12" style={{ color: "#9CA3AF" }}>
          送信履歴がありません
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-gray-100 p-3 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${NOTIFICATION_TYPE_COLORS[n.type]}`}
                    >
                      {NOTIFICATION_TYPE_LABELS[n.type]}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${NOTIFICATION_STATUS_COLORS[n.status]}`}
                    >
                      {NOTIFICATION_STATUS_LABELS[n.status]}
                    </span>
                    {n.candidate?.name && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#002D37" }}
                      >
                        {n.candidate.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <p
                    className={`text-sm whitespace-pre-wrap break-words ${
                      expanded === n.id ? "" : "line-clamp-2"
                    }`}
                    style={{ color: "#374151" }}
                  >
                    {n.content}
                  </p>
                  {n.content.length > 80 && (
                    <button
                      onClick={() =>
                        setExpanded(expanded === n.id ? null : n.id)
                      }
                      className="mt-1 text-xs"
                      style={{ color: "#00E05D" }}
                    >
                      {expanded === n.id ? "閉じる" : "すべて表示"}
                    </button>
                  )}
                </div>

                {/* Timestamp */}
                <div
                  className="flex-shrink-0 text-xs whitespace-nowrap"
                  style={{ color: "#9CA3AF" }}
                >
                  {new Date(n.sent_at ?? n.created_at).toLocaleString("ja-JP", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
