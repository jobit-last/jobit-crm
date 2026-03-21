"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApplicationStatus } from "@/types/application";
import { APPLICATION_STATUS_LABELS } from "@/types/application";

interface CandidateOption {
  id: string;
  name: string;
}

interface JobOption {
  id: string;
  title: string;
  company: { id: string; name: string } | null;
}

interface Props {
  candidates: CandidateOption[];
  jobs: JobOption[];
}

export default function ApplicationForm({ candidates, jobs }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    candidate_id: "",
    job_id: "",
    status: "document_screening" as ApplicationStatus,
    applied_at: new Date().toISOString().slice(0, 10),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      candidate_id: form.candidate_id,
      job_id: form.job_id,
      status: form.status,
      applied_at: form.applied_at || null,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    router.push(`/admin/applications/${json.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 選考情報 */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
          選考情報
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              求職者 <span className="text-red-500">*</span>
            </label>
            <select
              name="candidate_id"
              value={form.candidate_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">選択してください</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              求人 <span className="text-red-500">*</span>
            </label>
            <select
              name="job_id"
              value={form.job_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              <option value="">選択してください</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company?.name ? `${j.company.name} / ${j.title}` : j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            >
              {(Object.entries(APPLICATION_STATUS_LABELS) as [ApplicationStatus, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              応募日
            </label>
            <input
              type="date"
              name="applied_at"
              value={form.applied_at}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* ボタン */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752] disabled:opacity-60"
          style={{ backgroundColor: "#00E05D", color: "#002D37" }}
        >
          {loading ? "保存中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
