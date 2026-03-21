"use client";

import { useState } from "react";
import type { Schedule, ScheduleType } from "@/types/schedule";
import { SCHEDULE_TYPE_LABELS } from "@/types/schedule";

const SCHEDULE_TYPES: ScheduleType[] = ["meeting", "interview"];

interface Props {
  schedule: Schedule | null;
  defaultDatetime: string;
  candidates: { id: string; name: string }[];
  onSave: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ScheduleFormModal({
  schedule,
  defaultDatetime,
  candidates,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [form, setForm] = useState({
    type: (schedule?.type ?? "meeting") as ScheduleType,
    title: schedule?.title ?? "",
    candidate_id: schedule?.candidate_id ?? "",
    scheduled_at: schedule?.scheduled_at
      ? schedule.scheduled_at.slice(0, 16)
      : defaultDatetime,
    duration_minutes: schedule?.duration_minutes
      ? String(schedule.duration_minutes)
      : "",
    location: schedule?.location ?? "",
    notes: schedule?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      type: form.type,
      title: form.title,
      candidate_id: form.candidate_id || null,
      scheduled_at: form.scheduled_at,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      location: form.location || null,
      notes: form.notes || null,
    };

    const url = schedule ? `/api/schedules/${schedule.id}` : "/api/schedules";
    const method = schedule ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    onSave(json.data as Schedule);
  }

  async function handleDelete() {
    if (!schedule) return;
    if (!confirm("このスケジュールを削除しますか？")) return;
    setDeleting(true);
    const res = await fetch(`/api/schedules/${schedule.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      onDelete(schedule.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold" style={{ color: "#002D37" }}>
            {schedule ? "スケジュール編集" : "スケジュール追加"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 種別 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                種別 <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                {SCHEDULE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SCHEDULE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* 所要時間 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                所要時間（分）
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={form.duration_minutes}
                onChange={handleChange}
                min={1}
                max={480}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="例: 山田太郎さん 初回面談"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>

          {/* 日時 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              日時 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="scheduled_at"
              value={form.scheduled_at}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>

          {/* 求職者 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              求職者
            </label>
            <select
              name="candidate_id"
              value={form.candidate_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">選択なし</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 場所 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              場所
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="例: 東京オフィス 3F / Zoom"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              メモ
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="メモを入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <div>
              {schedule && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {deleting ? "削除中..." : "削除する"}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752] disabled:opacity-60"
                style={{ backgroundColor: "#00E05D", color: "#002D37" }}
              >
                {submitting ? "保存中..." : schedule ? "更新する" : "登録する"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
