"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  INTERVIEW_ROUND_TYPES,
  INTERVIEW_TYPE_LABELS,
} from "@/types/interview";
import type { InterviewType } from "@/types/interview";
import Spinner from "@/components/Spinner";

const C = {
  bg:      "#EBEEEF",
  main:    "#002D37",
  cta:     "#00E05D",
  ctaHov:  "#00A645",
};

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent";
const labelCls = "block text-xs font-medium mb-1" ;

interface AppOption {
  id: string;
  label: string;
  status: string;
}

export default function InterviewNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const [form, setForm] = useState({
    application_id: "",
    interview_type: "first" as InterviewType,
    scheduled_at:   "",
    location:       "",
    interviewer:    "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/applications?limit=200");
        const json = await res.json();
        const opts: AppOption[] = (json.data ?? []).map(
          (a: { id: string; candidate?: { name: string }; job?: { title: string; company?: { name: string } } }) => ({
            id:     a.id,
            label:  `${a.candidate?.name ?? "—"} ／ ${a.job?.company?.name ?? "—"} ／ ${a.job?.title ?? "—"}`,
            status: "",
          })
        );
        setApplications(opts);
      } finally {
        setLoadingApps(false);
      }
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.application_id) { setError("選考を選択してください"); return; }
    if (!form.scheduled_at)   { setError("日時を入力してください");  return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/interviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "登録に失敗しました"); return; }
      router.push(`/admin/applications/${form.application_id}`);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: C.bg }} className="min-h-full">
      <div className="max-w-xl mx-auto py-8 px-4">
        {/* パンくず */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/admin/applications" className="hover:underline" style={{ color: C.main }}>
            選考管理
          </Link>
          <span className="text-gray-400">/</span>
          <span style={{ color: C.main }}>面接登録</span>
        </div>

        <h1 className="text-2xl font-semibold mb-6" style={{ color: C.main }}>
          面接登録
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* 選考選択 */}
            <div>
              <label className={labelCls} style={{ color: C.main }}>
                選考 <span className="text-red-500">*</span>
              </label>
              {loadingApps ? (
                <div className="text-sm text-gray-400">読み込み中...</div>
              ) : (
                <select
                  name="application_id"
                  value={form.application_id}
                  onChange={handleChange}
                  required
                  className={inputCls}
                >
                  <option value="">選考を選択してください</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* 面接種別 */}
            <div>
              <label className={labelCls} style={{ color: C.main }}>
                面接種別 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {INTERVIEW_ROUND_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, interview_type: t }))}
                    className={`py-2 rounded-md text-sm font-medium border transition-colors ${
                      form.interview_type === t
                        ? "border-transparent text-white"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                    style={form.interview_type === t ? { backgroundColor: C.main } : undefined}
                  >
                    {INTERVIEW_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* 日時 */}
            <div>
              <label className={labelCls} style={{ color: C.main }}>
                日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="scheduled_at"
                value={form.scheduled_at}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* 場所 */}
            <div>
              <label className={labelCls} style={{ color: C.main }}>場所</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="例: 東京オフィス 3F会議室 / Zoom"
                className={inputCls}
              />
            </div>

            {/* 面接官 */}
            <div>
              <label className={labelCls} style={{ color: C.main }}>面接官名</label>
              <input
                type="text"
                name="interviewer"
                value={form.interviewer}
                onChange={handleChange}
                placeholder="例: 田中部長"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: C.cta, color: C.main }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = C.ctaHov; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.cta; }}
            >
              {submitting ? <><Spinner size={16} className="inline mr-1.5" />登録中...</> : "面接を登録する"}
            </button>
            <Link
              href="/admin/applications"
              className="px-8 py-2.5 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
