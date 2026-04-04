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

interface RaOption {
  id: string;
  name: string;
}

type TabType = "detail" | "job-posting";

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
  const [activeTab, setActiveTab] = useState<TabType>("detail");

  // RA一覧
  const [raList, setRaList] = useState<RaOption[]>([]);

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
    ra_id: "",
    notes: "",
  });

  // RA一覧を取得
  useEffect(() => {
    fetch("/api/users?role=ra")
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data || []).map((u: { id: string; name: string }) => ({
          id: u.id,
          name: u.name,
        }));
        setRaList(list);
      })
      .catch(() => {
        // usersエンドポイントが対応していない場合、全ユーザーを試行
        fetch("/api/users")
          .then((r) => r.json())
          .then((json) => {
            const list = (json.data || json || [])
              .filter((u: { role?: string }) => u.role === "ra" || u.role === "admin")
              .map((u: { id: string; name: string }) => ({
                id: u.id,
                name: u.name,
              }));
            setRaList(list);
          })
          .catch(() => {});
      });
  }, []);

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
        ra_id: c.ra_id || "",
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
        body: JSON.stringify({
          ...form,
          temperature: form.temperature || null,
          ra_id: form.ra_id || null,
        }),
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
        ra_id: company.ra_id || "",
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/companies"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              &larr; 企業一覧
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
          {!editing && activeTab === "detail" && (
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

        {/* タブ */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("detail")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "detail"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            企業詳細
          </button>
          <button
            onClick={() => setActiveTab("job-posting")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "job-posting"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            求人URL作成
          </button>
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

        {/* 企業詳細タブ */}
        {activeTab === "detail" && (
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

              {/* 担当RA */}
              <div>
                <label className={labelClass}>担当RA</label>
                <select
                  name="ra_id"
                  value={form.ra_id}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-700`}
                >
                  <option value="">未割り当て</option>
                  {raList.map((ra) => (
                    <option key={ra.id} value={ra.id}>
                      {ra.name}
                    </option>
                  ))}
                </select>
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
        )}

        {/* 求人URL作成タブ */}
        {activeTab === "job-posting" && (
          <JobPostingTab companyName={company?.name || ""} companyId={id} />
        )}
      </div>
    </div>
  );
}

/** 求人URL作成タブコンポーネント */
function JobPostingTab({ companyName, companyId }: { companyName: string; companyId: string }) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [training, setTraining] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const generateUrl = () => {
    const params = new URLSearchParams();
    params.set("company", companyName);
    params.set("company_id", companyId);
    if (jobTitle) params.set("title", jobTitle);
    if (jobDescription) params.set("description", jobDescription);
    if (salary) params.set("salary", salary);
    if (location) params.set("location", location);
    if (employmentType) params.set("type", employmentType);
    if (training) params.set("training", training);

    const url = `https://phtwtfci.gensparkspace.com/generator.html?${params.toString()}`;
    setGeneratedUrl(url);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-5">
      <h2 className="text-base font-semibold text-primary border-b border-secondary pb-2">
        求人URL作成
      </h2>
      <p className="text-sm text-gray-500">
        求人情報を入力してURLを生成します。生成されたURLをコピーして求人サイトに掲載できます。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>求人タイトル</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="例: フロントエンドエンジニア"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>勤務地</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例: 東京都渋谷区"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>給与</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="例: 400万〜600万"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>雇用形態</label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className={inputClass}
          >
            <option value="">選択してください</option>
            <option value="正社員">正社員</option>
            <option value="契紀社員">契約社員</option>
            <option value="派遣社員">派遣社員</option>
            <option value="パート・アルバイト">パート・アルバイト</option>
            <option value="業務委託">業務委託</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>求人内容</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          placeholder="求人の詳細説明を入力..."
          className={`${inputClass} font-mono text-sm`}
        />
      </div>

      <div>
        <label className={labelClass}>研修・トレーニング詳細</label>
        <textarea
          value={training}
          onChange={(e) => setTraining(e.target.value)}
          rows={3}
          placeholder="入社後の研修内容、トレーニング制度など..."
          className={`${inputClass} font-mono text-sm`}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={generateUrl}
          className="bg-cta hover:bg-cta-hover text-primary font-semibold px-6 py-2 rounded text-sm transition-colors"
        >
          URL生成
        </button>
      </div>

      {generatedUrl && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <label className={labelClass}>生成された求人URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={generatedUrl}
              readOnly
              className={`${inputClass} bg-white flex-1`}
            />
            <button
              type="button"
              onClick={copyUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
            >
              {copied ? "コピー済み!" : "コピー"}
            </button>
          </div>
          <div className="flex gap-2">
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              プレビューを開く &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
