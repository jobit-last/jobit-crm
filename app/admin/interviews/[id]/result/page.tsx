"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_COLORS,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_RESULT_COLORS,
} from "@/types/interview";
import type { InterviewResult } from "@/types/interview";
import { APPLICATION_STATUS_LABELS } from "@/types/application";
import type { ApplicationStatus } from "@/types/application";
import Spinner from "@/components/Spinner";

const C = {
  bg:     "#EBEEEF",
  main:   "#002D37",
  cta:    "#00E05D",
  ctaHov: "#00A645",
};

interface InterviewData {
  id: string;
  application_id: string;
  interview_type: string;
  scheduled_at: string;
  location: string | null;
  interviewer: string | null;
  result: InterviewResult | null;
  feedback: string | null;
  application?: {
    id: string;
    status: ApplicationStatus;
    candidate?: { id: string; name: string } | null;
    job?: { id: string; title: string; company?: { id: string; name: string } | null } | null;
  } | null;
}

const RESULTS: { value: InterviewResult; emoji: string; desc: string }[] = [
  { value: "pass",    emoji: "✅", desc: "合格" },
  { value: "fail",    emoji: "❌", desc: "不合格" },
  { value: "pending", emoji: "⏳", desc: "保留" },
];

const STATUS_MAP: Partial<Record<string, ApplicationStatus>> = {
  "first|pass":     "second_interview",
  "second|pass":    "final_interview",
  "final|pass":     "offered",
  "executive|pass": "offered",
  "first|fail":     "failed",
  "second|fail":    "failed",
  "final|fail":     "failed",
  "executive|fail": "failed",
};

export default function InterviewResultPage() {
  const router = useRouter();
  const { id }  = useParams<{ id: string }>();

  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved]           = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState<ApplicationStatus | null>(null);

  const [form, setForm] = useState<{ result: InterviewResult | ""; feedback: string }>({
    result:   "",
    feedback: "",
  });

  const fetchInterview = useCallback(async () => {
    try {
      const res  = await fetch(`/api/interviews/${id}`);
      const json = await res.json();
      if (!res.ok) { setError("面接情報の取得に失敗しました"); return; }
      const iw: InterviewData = json.data;
      setInterview(iw);
      setForm({
        result:   iw.result ?? "",
        feedback: iw.feedback ?? "",
      });
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchInterview(); }, [fetchInterview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.result) { setError("結果を選択してください"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res  = await fetch(`/api/interviews/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ result: form.result, feedback: form.feedback }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "保存に失敗しました"); return; }
      setSaved(true);
      if (json.status_updated) setUpdatedStatus(json.status_updated);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const predictedStatus = interview
    ? STATUS_MAP[`${interview.interview_type}|${form.result}`] ?? null
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  const app = interview?.application;

  return (
    <div style={{ backgroundColor: C.bg }} className="min-h-full">
      <div className="max-w-xl mx-auto py-8 px-4">
        {/* パンくず */}
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <Link href="/admin/applications" className="hover:underline" style={{ color: C.main }}>
            選考管理
          </Link>
          <span className="text-gray-400">/</span>
          {app && (
            <>
              <Link href={`/admin/applications/${app.id}`} className="hover:underline" style={{ color: C.main }}>
                {app.candidate?.name}
              </Link>
              <span className="text-gray-400">/</span>
            </>
          )}
          <span style={{ color: C.main }}>結果入力</span>
        </div>

        <h1 className="text-2xl font-semibold mb-2" style={{ color: C.main }}>
          面接結果入力
        </h1>

        {/* 面接サマリー */}
        {interview && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  INTERVIEW_TYPE_COLORS[interview.interview_type as keyof typeof INTERVIEW_TYPE_COLORS] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {INTERVIEW_TYPE_LABELS[interview.interview_type as keyof typeof INTERVIEW_TYPE_LABELS] ??
                  interview.interview_type}
              </span>
              {interview.result && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_RESULT_COLORS[interview.result]}`}
                >
                  {INTERVIEW_RESULT_LABELS[interview.result]}（登録済み）
                </span>
              )}
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="w-20 text-gray-500 shrink-0">求職者</dt>
                <dd style={{ color: C.main }} className="font-medium">{app?.candidate?.name ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 text-gray-500 shrink-0">企業 / 求人</dt>
                <dd style={{ color: C.main }}>{app?.job?.company?.name} ／ {app?.job?.title}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 text-gray-500 shrink-0">日時</dt>
                <dd style={{ color: C.main }}>
                  {new Date(interview.scheduled_at).toLocaleString("ja-JP", {
                    year: "numeric", month: "2-digit", day: "2-digit",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </dd>
              </div>
              {interview.location && (
                <div className="flex gap-2">
                  <dt className="w-20 text-gray-500 shrink-0">場所</dt>
                  <dd style={{ color: C.main }}>{interview.location}</dd>
                </div>
              )}
              {interview.interviewer && (
                <div className="flex gap-2">
                  <dt className="w-20 text-gray-500 shrink-0">面接官</dt>
                  <dd style={{ color: C.main }}>{interview.interviewer}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* 保存済みバナー */}
        {saved && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-6">
            <p className="text-sm font-semibold text-green-700 mb-1">結果を保存しました</p>
            {updatedStatus && (
              <p className="text-sm text-green-600">
                選考ステータスを
                <span className="font-semibold">「{APPLICATION_STATUS_LABELS[updatedStatus]}」</span>
                に自動更新しました
              </p>
            )}
            <div className="flex gap-3 mt-3">
              <Link
                href={`/admin/applications/${app?.id}`}
                className="text-sm px-4 py-1.5 rounded-md font-medium text-white transition-colors"
                style={{ backgroundColor: C.main }}
              >
                選考詳細へ
              </Link>
              <Link
                href="/admin/applications"
                className="text-sm px-4 py-1.5 rounded-md font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                選考一覧へ
              </Link>
            </div>
          </div>
        )}

        {!saved && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* 結果選択 */}
              <div>
                <p className="text-xs font-medium mb-3" style={{ color: C.main }}>
                  結果 <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {RESULTS.map(({ value, emoji, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, result: value }))}
                      className={`flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 transition-all ${
                        form.result === value
                          ? "border-transparent shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={
                        form.result === value
                          ? { backgroundColor: C.main, color: "#fff" }
                          : undefined
                      }
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-sm font-semibold">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ステータス予測 */}
              {form.result && form.result !== "pending" && predictedStatus && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                  保存すると選考ステータスが
                  <span className="font-semibold">「{APPLICATION_STATUS_LABELS[predictedStatus]}」</span>
                  に自動更新されます
                </div>
              )}
              {form.result === "pending" && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500">
                  「保留」の場合、選考ステータスは変更されません
                </div>
              )}

              {/* フィードバック */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.main }}>
                  フィードバック
                </label>
                <textarea
                  value={form.feedback}
                  onChange={(e) => setForm((prev) => ({ ...prev, feedback: e.target.value }))}
                  rows={5}
                  placeholder="面接での印象・評価コメントを入力..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting || !form.result}
                className="px-8 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: C.cta, color: C.main }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = C.ctaHov; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.cta; }}
              >
                {submitting ? <><Spinner size={16} className="inline mr-1.5" />保存中...</> : "結果を保存する"}
              </button>
              <Link
                href={app ? `/admin/applications/${app.id}` : "/admin/applications"}
                className="px-8 py-2.5 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
              >
                キャンセル
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
