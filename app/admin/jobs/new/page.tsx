"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Company } from "@/types/company";

const inputClass = "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm font-medium text-primary mb-1";

export default function JobNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

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

  useEffect(() => {
    fetch("/api/companies?per_page=100")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCompanies(json.data); });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("求人タイトルは必須です"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          company_id: form.company_id || null,
          salary_min: form.salary_min || null,
          salary_max: form.salary_max || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "登録に失敗しました"); return; }
      router.push(`/admin/jobs/${json.data.id}`);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/jobs" className="text-sm text-gray-500 hover:text-primary transition-colors">
            ← 求人一覧
          </Link>
          <h1 className="text-2xl font-bold text-primary">求人 新規登録</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>
            )}

            <h2 className="text-base font-semibold text-primary border-b border-secondary pb-2">基本情報</h2>

            <div>
              <label className={labelClass}>求人タイトル <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                placeholder="Webエンジニア（バックエンド）" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>企業</label>
              <select name="company_id" value={form.company_id} onChange={handleChange} className={inputClass}>
                <option value="">企業を選択</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>職種</label>
                <input type="text" name="job_type" value={form.job_type} onChange={handleChange}
                  placeholder="バックエンドエンジニア" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>勤務地</label>
                <input type="text" name="location" value={form.location} onChange={handleChange}
                  placeholder="東京都渋谷区（リモート可）" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>年収下限（万円）</label>
                <input type="number" name="salary_min" value={form.salary_min} onChange={handleChange}
                  placeholder="400" min={0} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>年収上限（万円）</label>
                <input type="number" name="salary_max" value={form.salary_max} onChange={handleChange}
                  placeholder="800" min={0} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>必須スキル</label>
              <input type="text" name="required_skills" value={form.required_skills} onChange={handleChange}
                placeholder="TypeScript, Node.js, PostgreSQL" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>求人詳細</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={6} placeholder="業務内容・求める人物像など" className={inputClass} />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
                className="w-4 h-4 accent-cta"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-primary cursor-pointer">
                公開する
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={submitting}
              className="bg-cta hover:bg-cta-hover text-primary font-semibold px-8 py-2 rounded text-sm transition-colors disabled:opacity-50">
              {submitting ? "登録中..." : "登録する"}
            </button>
            <Link href="/admin/jobs"
              className="bg-secondary hover:bg-gray-300 text-primary px-8 py-2 rounded text-sm font-medium transition-colors">
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
