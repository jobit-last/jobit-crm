"use client";

import { useState } from "react";
import type { Notification } from "@/types/notification";
import SendForm from "./SendForm";
import HistoryList from "./HistoryList";

interface Props {
  initialNotifications: Notification[];
  candidates: { id: string; name: string }[];
}

export default function NotificationClient({
  initialNotifications,
  candidates,
}: Props) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  function handleSent(notification: Notification) {
    setNotifications((prev) => [notification, ...prev]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#002D37" }}>
          通知管理
        </h1>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
          UI確認モード（実送信未連携）
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 送信フォーム */}
        <div className="lg:col-span-2">
          <SendForm candidates={candidates} onSent={handleSent} />
        </div>

        {/* 送信履歴 */}
        <div className="lg:col-span-3">
          <HistoryList notifications={notifications} />
        </div>
      </div>
    </div>
  );
}
