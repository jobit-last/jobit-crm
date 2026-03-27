"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  TEMPERATURE_LABELS,
  TEMPERATURE_COLORS,
  type Company,
  type Temperature,
} from "@/types/company";
import Spinner from "@/components/Spinner";

const TEMPERATURES = Object.keys(TEMPERATURE_LABELS) as Temperature[];

const inputClass =
  "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm font-medium text-primary mb-1";

export default function CompanyDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch(`/api/companies/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError("企業情報の取得に失敗しました");
        return;
      }
      const c: Company = json.data;
      setCompany(c);
      setForm({
        name: c.name,
        industry: c.industry || "",
        company_size: c.company_size || "",
        location: c.location || "",
        website: c.website || "",
        contact_name: c.contact_name || "",
        contact_email: c.contact_email || "",
        contact_phone: c.contact_phone || "",
        temperature: (c.temperature as Temperature) || "",
        notes: c.notes || "",
      });
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("企業名は必須です");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, temperature: form.temperature || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "更新に失敗しました");
        return;
      }
      setCompany(json.data);
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
    if (!confirm(`「${company?.name}」を削除してもよろしいですか？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "削除に失敗しました");
        return;
      }
      router.push("/admin/companies");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      setForm({
        name: company.name,
        industry: company.industry || "",
        company_size: company.company_size || "",
        location: company.location || "",
        website: company.website || "",
        contact_name: company.contact_name || "",
        contact_email: company.contact_email || "",
        contact_phone: company.contact_phone || "",
        temperature: (company.temperature as Temperature) || "",
        notes: company.notes || "",
      });
    }
    setEditing(false);
    setError("");
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

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
            <Link
              href="/admin/companies"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              ← 企業一覧
            </Link>
            <h1 className="text-2xl font-bold text-primary">{company?.name}</h1>
            {company?.temperature && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  TEMPERATURE_COLORS[company.temperature as Temperature]
                }`}
              >
                {TEMPERATURE_LABELS[company.temperature as Temperature]}
              </span>
            )}
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="bg-cta hover:bg-cta-hover text-primary font-semibold px-5 py-2 rounded text-sm transition-colors"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? <><Spinner size={16} className="inline mr-1.5" />削除中...</> : "削除"}
              </button>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 text-sm mb-4">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="bg-white rounded-lg shadow p-6 space-y-5">
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
                disabled={!editing}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>業種</label>
                <input
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
                />
              </div>
              <div>
                <label className={labelClass}>企業規模</label>
                <input
                  type="text"
                  name="company_size"
                  value={form.company_size}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>所在地</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
                />
              </div>
              <div>
                <label className={labelClass}>採用温度</label>
                <select
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
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
                disabled={!editing}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
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
                disabled={!editing}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>メールアドレス</label>
                <input
                  type="email"
                  name="contact_email"
                  value={form.contact_email}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
                />
              </div>
              <div>
                <label className={labelClass}>電話番号</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
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
                disabled={!editing}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
              />
            </div>

            {company && (
              <div className="pt-2 border-t border-secondary text-xs text-gray-400 space-y-1">
                <p>登録日: {formatDate(company.created_at)}</p>
                <p>更新日: {formatDate(company.updated_at)}</p>
              </div>
            )}
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="bg-cta hover:bg-cta-hover text-primary font-semibold px-8 py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? <><Spinner size={16} className="inline mr-1.5" />保存中...</> : "保存する"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-secondary hover:bg-gray-300 text-primary px-8 py-2 rounded text-sm font-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
