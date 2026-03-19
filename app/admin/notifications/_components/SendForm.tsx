"use client";

import { useState } from "react";
import type { Notification, NotificationType } from "@/types/notification";
import {
  NOTIFICATION_TYPE_LABELS,
  TEMPLATES,
} from "@/types/notification";

const NOTIFICATION_TYPES: NotificationType[] = ["LINE", "SMS", "email"];

const TYPE_ICONS: Record<NotificationType, string> = {
  LINE: "💬",
  SMS: "📱",
  email: "✉️",
};

interface Props {
  candidates: { id: string; name: string }[];
  onSent: (notification: Notification) => void;
}

export default function SendForm({ candidates, onSent }: Props) {
  const [form, setForm] = useState({
    candidate_id: "",
    type: "email" as NotificationType,
    content: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleTemplateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setSelectedTemplate(value);
    if (value) {
      const tmpl = TEMPLATES.find((t) => t.label === value);
      if (tmpl) setForm((prev) => ({ ...prev, content: tmpl.content }));
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "content") setSelectedTemplate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: form.candidate_id || null,
        type: form.type,
        content: form.content,
        status: "sent",
        sent_at: new Date().toISOString(),
      }),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    onSent(json.data as Notification);
    setSuccess(true);
    setForm((prev) => ({ ...prev, content: "" }));
    setSelectedTemplate("");
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold mb-5" style={{ color: "#1A1A2E" }}>
        通知を送信
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 宛先 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            宛先（求職者）
          </label>
          <select
            name="candidate_id"
            value={form.candidate_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
          >
            <option value="">選択なし</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 送信種別 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            送信種別 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {NOTIFICATION_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                className="flex-1 py-2.5 rounded-md text-sm font-medium border transition-all"
                style={
                  form.type === t
                    ? { backgroundColor: "#002D37", color: "white", borderColor: "#002D37" }
                    : { borderColor: "#D1D5DB", color: "#6B7280" }
                }
              >
                <span className="mr-1">{TYPE_ICONS[t]}</span>
                {NOTIFICATION_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* テンプレート */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            テンプレートから選択
          </label>
          <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
          >
            <option value="">テンプレートを選択...</option>
            {TEMPLATES.map((t) => (
              <option key={t.label} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            送信内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={7}
            placeholder="送信内容を入力、またはテンプレートを選択してください..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-right" style={{ color: "#9CA3AF" }}>
            {form.content.length} 文字
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {success && (
          <div
            className="rounded-md px-4 py-3 text-sm"
            style={{ backgroundColor: "#CCFBF1", color: "#0F766E" }}
          >
            送信記録を保存しました。
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !form.content.trim()}
          className="w-full py-2.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#002D37" }}
        >
          {submitting ? "送信中..." : "送信する"}
        </button>

        <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
          ※ 現在はUI確認モードです。実際の送信はAPI連携後に有効化されます。
        </p>
      </form>
    </section>
  );
}
