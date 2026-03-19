"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEMPERATURE_LABELS, type Temperature } from "@/types/company";

const TEMPERATURES = Object.keys(TEMPERATURE_LABELS) as Temperature[];

const inputClass =
  "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm font-medium text-primary mb-1";

export default function CompanyNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    industry: "",
    company_size: "",
    location: "",
    website: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    temperature: "" as Temperature | "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("企業名は必須です");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, temperature: form.temperature || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "登録に失敗しました");
        return;
      }
      router.push(`/admin/companies/${json.data.id}`);
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
          <Link
            href="/admin/companies"
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            ← 企業一覧
          </Link>
          <h1 className="text-2xl font-bold text-primary">企業 新規登録</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <h2 className="text-base font-semibold text-primary border-b border-secondary pb-2">
              基本情報
            </h2>

            <div>
              <label className={labelClass}>
                企業名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="株式会社〇〇"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>業種</label>
                <input
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="IT・通信"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>企業規模</label>
                <input
                  type="text"
                  name="company_size"
                  value={form.company_size}
                  onChange={handleChange}
                  placeholder="100〜500名"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>所在地</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="東京都渋谷区"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>採用温度</label>
                <select
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">未設定</option>
                  {TEMPERATURES.map((t) => (
                    <option key={t} value={t}>
                      {TEMPERATURE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Webサイト</label>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>

            <h2 className="text-base font-semibold text-primary border-b border-secondary pb-2 pt-2">
              担当者情報
            </h2>

            <div>
              <label className={labelClass}>担当者名</label>
              <input
                type="text"
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                placeholder="山田 太郎"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>メールアドレス</label>
                <input
                  type="email"
                  name="contact_email"
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>電話番号</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleChange}
                  placeholder="03-0000-0000"
                  className={inputClass}
                />
              </div>
            </div>

            <h2 className="text-base font-semibold text-primary border-b border-secondary pb-2 pt-2">
              備考
            </h2>

            <div>
              <label className={labelClass}>メモ・備考</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="特記事項など"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="bg-cta hover:bg-cta-hover text-white px-8 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? "登録中..." : "登録する"}
            </button>
            <Link
              href="/admin/companies"
              className="bg-secondary hover:bg-gray-300 text-primary px-8 py-2 rounded text-sm font-medium transition-colors"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
