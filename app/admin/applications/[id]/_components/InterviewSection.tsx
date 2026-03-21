"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  Interview,
  InterviewType,
  InterviewResult,
  InterviewUpdate,
} from "@/types/interview";
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_COLORS,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_RESULT_COLORS,
} from "@/types/interview";

interface Props {
  applicationId: string;
  initialInterviews: Interview[];
}

const INTERVIEW_TYPES: InterviewType[] = ["phone", "online", "onsite"];
const INTERVIEW_RESULTS: InterviewResult[] = ["pass", "fail", "pending"];

const EMPTY_FORM = {
  interview_type: "onsite" as InterviewType,
  scheduled_at: "",
  location: "",
  interviewer: "",
  result: "" as InterviewResult | "",
  feedback: "",
};

export default function InterviewSection({ applicationId, initialInterviews }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openAddForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowAddForm(true);
  }

  function openEditForm(interview: Interview) {
    setForm({
      interview_type: interview.interview_type,
      scheduled_at: interview.scheduled_at.slice(0, 16), // datetime-local format
      location: interview.location ?? "",
      interviewer: interview.interviewer ?? "",
      result: interview.result ?? "",
      feedback: interview.feedback ?? "",
    });
    setEditingId(interview.id);
    setError(null);
    setShowAddForm(true);
  }

  function closeForm() {
    setShowAddForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      interview_type: form.interview_type,
      scheduled_at: form.scheduled_at,
      location: form.location || null,
      interviewer: form.interviewer || null,
      result: form.result || null,
      feedback: form.feedback || null,
    };

    const url = editingId
      ? `/api/applications/${applicationId}/interviews/${editingId}`
      : `/api/applications/${applicationId}/interviews`;
    const method = editingId ? "PUT" : "POST";

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

    if (editingId) {
      setInterviews((prev) =>
        prev.map((i) => (i.id === editingId ? (json.data as Interview) : i))
      );
    } else {
      setInterviews((prev) =>
        [...prev, json.data as Interview].sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        )
      );
    }

    closeForm();
    startTransition(() => router.refresh());
  }

  async function handleDelete(interviewId: string) {
    setDeletingId(interviewId);

    const res = await fetch(
      `/api/applications/${applicationId}/interviews/${interviewId}`,
      { method: "DELETE" }
    );

    setDeletingId(null);

    if (res.ok) {
      setInterviews((prev) => prev.filter((i) => i.id !== interviewId));
      startTransition(() => router.refresh());
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "#002D37" }}>
          面接日程管理
        </h2>
        {!showAddForm && (
          <button
            onClick={openAddForm}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00A645]"
            style={{ backgroundColor: "#00E05D" }}
          >
            + 面接を追加
          </button>
        )}
      </div>

      {/* 登録・編集フォーム */}
      {showAddForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#002D37" }}>
            {editingId ? "面接を編集" : "面接を追加"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 面接種別 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  面接種別 <span className="text-red-500">*</span>
                </label>
                <select
                  name="interview_type"
                  value={form.interview_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>{INTERVIEW_TYPE_LABELS[t]}</option>
                  ))}
                </select>
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

              {/* 場所 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">場所</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="例: 東京オフィス 3F会議室 / Zoom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                />
              </div>

              {/* 面接官 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">面接官</label>
                <input
                  type="text"
                  name="interviewer"
                  value={form.interviewer}
                  onChange={handleChange}
                  placeholder="例: 田中部長"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                />
              </div>

              {/* 結果 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">結果</label>
                <select
                  name="result"
                  value={form.result}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                >
                  <option value="">未入力</option>
                  {INTERVIEW_RESULTS.map((r) => (
                    <option key={r} value={r}>{INTERVIEW_RESULT_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* フィードバック */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                フィードバック
              </label>
              <textarea
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                rows={3}
                placeholder="面接のフィードバックを入力..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00A645] disabled:opacity-60"
                style={{ backgroundColor: "#00E05D" }}
              >
                {submitting ? "保存中..." : editingId ? "更新する" : "登録する"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 面接一覧 */}
      {interviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          面接日程が登録されていません
        </p>
      ) : (
        <ul className="space-y-3">
          {interviews.map((interview) => (
            <li
              key={interview.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* ヘッダー行 */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_TYPE_COLORS[interview.interview_type]}`}
                    >
                      {INTERVIEW_TYPE_LABELS[interview.interview_type]}
                    </span>
                    {interview.result && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_RESULT_COLORS[interview.result]}`}
                      >
                        {INTERVIEW_RESULT_LABELS[interview.result]}
                      </span>
                    )}
                  </div>

                  {/* 日時 */}
                  <p className="text-sm font-medium" style={{ color: "#002D37" }}>
                    {new Date(interview.scheduled_at).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* 場所・面接官 */}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "#6B7280" }}>
                    {interview.location && (
                      <span>📍 {interview.location}</span>
                    )}
                    {interview.interviewer && (
                      <span>👤 {interview.interviewer}</span>
                    )}
                  </div>

                  {/* フィードバック */}
                  {interview.feedback && (
                    <p
                      className="mt-2 text-sm whitespace-pre-wrap break-words p-2 rounded bg-gray-50"
                      style={{ color: "#002D37" }}
                    >
                      {interview.feedback}
                    </p>
                  )}
                </div>

                {/* 操作ボタン */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(interview)}
                    className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(interview.id)}
                    disabled={deletingId === interview.id}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    {deletingId === interview.id ? "削除中..." : "削除"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
