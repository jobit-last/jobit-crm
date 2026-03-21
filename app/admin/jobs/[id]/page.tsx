"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Job } from "@/types/job";
import type { Company } from "@/types/company";

const inputClass = "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm font-medium text-primary mb-1";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    company_id: "",
    title: "",
    description: "",
    job_type: "",
    location: "",
    salary_min: "",
    salary_max: "",
    required_skills: "",
    is_published: false,
  });

  const fetchJob = useCallback(async () => {
    try {
      const [jobRes, companiesRes] = await Promise.all([
        fetch(`/api/jobs/${id}`),
        fetch("/api/companies?per_page=100"),
      ]);
      const [jobJson, companiesJson] = await Promise.all([jobRes.json(), companiesRes.json()]);

      if (!jobRes.ok || !jobJson.success) { setError("求人情報の取得に失敗しました"); return; }
      if (companiesJson.success) setCompanies(companiesJson.data);

      const j: Job = jobJson.data;
      setJob(j);
      setForm({
        company_id: j.company_id || "",
        title: j.title,
        description: j.description || "",
        job_type: j.job_type || "",
        location: j.location || "",
        salary_min: j.salary_min != null ? String(j.salary_min) : "",
        salary_max: j.salary_max != null ? String(j.salary_max) : "",
        required_skills: j.required_skills || "",
        is_published: j.is_published,
      });
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("求人タイトルは必須です"); return; }
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          company_id: form.company_id || null,
          salary_min: form.salary_min || null,
          salary_max: form.salary_max || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "更新に失敗しました"); return; }
      setJob({ ...json.data, company_name: companies.find((c) => c.id === json.data.company_id)?.name });
      setEditing(false);
      setSuccessMsg("更新しました");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${job?.title}」を削除してもよろしいですか？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "削除に失敗しました"); return; }
      router.push("/admin/jobs");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (job) {
      setForm({
        company_id: job.company_id || "",
        title: job.title,
        description: job.description || "",
        job_type: job.job_type || "",
        location: job.location || "",
        salary_min: job.salary_min != null ? String(job.salary_min) : "",
        salary_max: job.salary_max != null ? String(job.salary_max) : "",
        required_skills: job.required_skills || "",
        is_published: job.is_published,
      });
    }
    setEditing(false);
    setError("");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/jobs" className="text-sm text-gray-500 hover:text-primary transition-colors">
              ← 求人一覧
            </Link>
            <h1 className="text-2xl font-bold text-primary">{job?.title}</h1>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              job?.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${job?.is_published ? "bg-green-500" : "bg-gray-400"}`} />
              {job?.is_published ? "公開中" : "非公開"}
            </span>
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded text-sm font-medium transition-colors">
                編集
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50">
                {deleting ? "削除中..." : "削除"}
              </button>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 text-sm mb-4">{successMsg}</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSave}>
          <div className="bg-white rounded-lg shadow p-6 space-y-5">
            <h2 className="text-base font-semibold text-primary border-b border-secondary pb-2">基本情報</h2>

            <div>
              <label className={labelClass}>求人タイトル <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} disabled={!editing}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`} />
            </div>

            <div>
              <label className={labelClass}>企業</label>
              <select name="company_id" value={form.company_id} onChange={handleChange} disabled={!editing}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}>
                <option value="">企業を選択</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>職種</label>
                <input type="text" name="job_type" value={form.job_type} onChange={handleChange} disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`} />
              </div>
              <div>
                <label className={labelClass}>勤務地</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>年収下限（万円）</label>
                <input type="number" name="salary_min" value={form.salary_min} onChange={handleChange}
                  disabled={!editing} min={0} className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`} />
              </div>
              <div>
                <label className={labelClass}>年収上限（万円）</label>
                <input type="number" name="salary_max" value={form.salary_max} onChange={handleChange}
                  disabled={!editing} min={0} className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>必須スキル</label>
              <input type="text" name="required_skills" value={form.required_skills} onChange={handleChange}
                disabled={!editing} className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`} />
            </div>

            <div>
              <label className={labelClass}>求人詳細</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={6} disabled={!editing}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`} />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input type="checkbox" id="is_published" name="is_published"
                checked={form.is_published} onChange={handleChange}
                disabled={!editing} className="w-4 h-4 accent-cta disabled:opacity-50" />
              <label htmlFor="is_published" className={`text-sm font-medium text-primary ${editing ? "cursor-pointer" : ""}`}>
                公開する
              </label>
            </div>

            {job && (
              <div className="pt-2 border-t border-secondary text-xs text-gray-400 space-y-1">
                <p>登録日: {formatDate(job.created_at)}</p>
                <p>更新日: {formatDate(job.updated_at)}</p>
              </div>
            )}
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={submitting}
                className="bg-cta hover:bg-cta-hover text-white px-8 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50">
                {submitting ? "保存中..." : "保存する"}
              </button>
              <button type="button" onClick={handleCancel}
                className="bg-secondary hover:bg-gray-300 text-primary px-8 py-2 rounded text-sm font-medium transition-colors">
                キャンセル
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
