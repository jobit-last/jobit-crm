"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  Interview,
  InterviewType,
  InterviewResult,
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

export default function InterviewsClient({
  applicationId,
  initialInterviews,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // 結果入力モード
  const [resultEditId, setResultEditId] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState({
    result: "" as InterviewResult | "",
    feedback: "",
  });
  const [resultSubmitting, setResultSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ---------- 追加 ----------
  function openAddForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  // ---------- 編集（日程変更） ----------
  function openEditForm(interview: Interview) {
    setForm({
      interview_type: interview.interview_type,
      scheduled_at: interview.scheduled_at.slice(0, 16),
      location: interview.location ?? "",
      interviewer: interview.interviewer ?? "",
      result: interview.result ?? "",
      feedback: interview.feedback ?? "",
    });
    setEditingId(interview.id);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
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
          (a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        )
      );
    }

    closeForm();
    startTransition(() => router.refresh());
  }

  // ---------- 結果・フィードバック入力 ----------
  function openResultForm(interview: Interview) {
    setResultForm({
      result: interview.result ?? "",
      feedback: interview.feedback ?? "",
    });
    setResultEditId(interview.id);
  }

  function closeResultForm() {
    setResultEditId(null);
  }

  async function handleResultSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resultEditId) return;
    setResultSubmitting(true);

    const payload = {
      result: resultForm.result || null,
      feedback: resultForm.feedback || null,
    };

    const res = await fetch(
      `/api/applications/${applicationId}/interviews/${resultEditId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    setResultSubmitting(false);

    if (!res.ok) return;

    setInterviews((prev) =>
      prev.map((i) => (i.id === resultEditId ? (json.data as Interview) : i))
    );
    closeResultForm();
    startTransition(() => router.refresh());
  }

  // ---------- キャンセル（削除） ----------
  async function handleCancel(interviewId: string) {
    if (!confirm("この面接をキャンセル（削除）しますか？")) return;
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

  // ---------- ステータスに応じたラベル ----------
  function getScheduleStatus(interview: Interview) {
    const now = new Date();
    const scheduled = new Date(interview.scheduled_at);
    if (interview.result) return null; // 結果入力済み
    if (scheduled < now) return { label: "実施済み", cls: "bg-gray-100 text-gray-600" };
    return { label: "予定", cls: "bg-blue-50 text-blue-600" };
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "#6B7280" }}>
          全 <span className="font-semibold" style={{ color: "#002D37" }}>{interviews.length}</span> 件
        </p>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="px-4 py-2 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00c752]"
            style={{ backgroundColor: "#00E05D" }}
          >
            + 面接を追加
          </button>
        )}
      </div>

      {/* 登録・編集フォーム */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            {editingId ? "面接日程を編集" : "面接日程を登録"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <option key={t} value={t}>
                      {INTERVIEW_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  場所
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="例: 東京オフィス 3F会議室 / Zoom URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  面接官名
                </label>
                <input
                  type="text"
                  name="interviewer"
                  value={form.interviewer}
                  onChange={handleChange}
                  placeholder="例: 田中部長"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                />
              </div>

              {editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      結果
                    </label>
                    <select
                      name="result"
                      value={form.result}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                    >
                      <option value="">未入力</option>
                      {INTERVIEW_RESULTS.map((r) => (
                        <option key={r} value={r}>
                          {INTERVIEW_RESULT_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                </>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00c752] disabled:opacity-60"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">面接日程が登録されていません</p>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="mt-4 px-4 py-2 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00c752]"
              style={{ backgroundColor: "#00E05D" }}
            >
              最初の面接を登録する
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => {
            const scheduleStatus = getScheduleStatus(interview);
            const isResultEditing = resultEditId === interview.id;

            return (
              <div
                key={interview.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* ヘッダー: バッジ + 操作ボタン */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_TYPE_COLORS[interview.interview_type]}`}
                    >
                      {INTERVIEW_TYPE_LABELS[interview.interview_type]}
                    </span>
                    {interview.result && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_RESULT_COLORS[interview.result]}`}
                      >
                        {INTERVIEW_RESULT_LABELS[interview.result]}
                      </span>
                    )}
                    {scheduleStatus && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scheduleStatus.cls}`}
                      >
                        {scheduleStatus.label}
                      </span>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(interview)}
                      className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      日程変更
                    </button>
                    {!interview.result && (
                      <button
                        onClick={() => openResultForm(interview)}
                        className="text-xs px-3 py-1.5 rounded-md font-medium text-[#002D37] transition-colors hover:bg-[#00c752]"
                        style={{ backgroundColor: "#00E05D" }}
                      >
                        結果入力
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(interview.id)}
                      disabled={deletingId === interview.id}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {deletingId === interview.id ? "削除中..." : "キャンセル"}
                    </button>
                  </div>
                </div>

                {/* 面接詳細 */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">日時</p>
                    <p className="text-sm font-medium" style={{ color: "#002D37" }}>
                      {new Date(interview.scheduled_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">場所</p>
                    <p className="text-sm" style={{ color: "#002D37" }}>
                      {interview.location || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">面接官</p>
                    <p className="text-sm" style={{ color: "#002D37" }}>
                      {interview.interviewer || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">登録日</p>
                    <p className="text-sm text-gray-500">
                      {new Date(interview.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>

                {/* フィードバック表示 */}
                {interview.feedback && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-400 mb-1">フィードバック</p>
                    <div
                      className="text-sm whitespace-pre-wrap break-words p-3 rounded-md"
                      style={{ backgroundColor: "#F9FAFB", color: "#002D37" }}
                    >
                      {interview.feedback}
                    </div>
                  </div>
                )}

                {/* 結果入力インラインフォーム */}
                {isResultEditing && (
                  <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "#002D37" }}>
                      結果・フィードバック入力
                    </h3>
                    <form onSubmit={handleResultSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            結果 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={resultForm.result}
                            onChange={(e) =>
                              setResultForm((prev) => ({
                                ...prev,
                                result: e.target.value as InterviewResult | "",
                              }))
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                          >
                            <option value="">選択してください</option>
                            {INTERVIEW_RESULTS.map((r) => (
                              <option key={r} value={r}>
                                {INTERVIEW_RESULT_LABELS[r]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          フィードバック
                        </label>
                        <textarea
                          value={resultForm.feedback}
                          onChange={(e) =>
                            setResultForm((prev) => ({
                              ...prev,
                              feedback: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="面接のフィードバックを入力..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={closeResultForm}
                          className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          disabled={resultSubmitting}
                          className="px-4 py-2 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00c752] disabled:opacity-60"
                          style={{ backgroundColor: "#00E05D" }}
                        >
                          {resultSubmitting ? "保存中..." : "結果を保存"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
