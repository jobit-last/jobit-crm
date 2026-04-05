"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Candidate, Advisor, CandidateStatus, Gender, CandidateSource, FormType, ContactStatus, InterviewType, LivingArrangement } from "@/types/candidate";
import { STATUS_LABELS, SOURCE_LABELS, FORM_TYPE_LABELS, CONTACT_STATUS_LABELS, INTERVIEW_TYPE_LABELS, LIVING_ARRANGEMENT_LABELS, PREFECTURE_OPTIONS } from "@/types/candidate";
import Spinner from "@/components/Spinner";

interface Props {
  mode: "create" | "edit";
  advisors: Advisor[];
  initialData?: Partial<Candidate>;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "other", label: "その他" },
];

export default function CandidateForm({ mode, advisors, initialData = {} }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createPortal, setCreatePortal] = useState(false);
  const [portalResult, setPortalResult] = useState<{ email: string; loginId: string } | null>(null);

  const [form, setForm] = useState({
    name: initialData.name ?? "",
    email: initialData.email ?? "",
    phone: initialData.phone ?? "",
    birth_date: initialData.birth_date ?? "",
    gender: (initialData.gender ?? "") as Gender | "",
    current_company: initialData.current_company ?? "",
    current_salary: initialData.current_salary?.toString() ?? "",
    desired_salary: initialData.desired_salary?.toString() ?? "",
    status: (initialData.status ?? "new") as CandidateStatus,
    ca_id: initialData.ca_id ?? "",
    // 流入情報
    source: (initialData.source ?? "") as CandidateSource | "",
    form_type: (initialData.form_type ?? "") as FormType | "",
    ad_identifier: initialData.ad_identifier ?? "",
    utm_source: initialData.utm_source ?? "",
    utm_medium: initialData.utm_medium ?? "",
    utm_campaign: initialData.utm_campaign ?? "",
    // LINE連携
    line_registered: initialData.line_registered ?? false,
    line_id: initialData.line_id ?? "",
    line_display_name: initialData.line_display_name ?? "",
    // 通電・面談管理
    application_date: initialData.application_date ?? "",
    application_time: initialData.application_time ?? "",
    contact_status: (initialData.contact_status ?? "") as ContactStatus | "",
    contact_notes: initialData.contact_notes ?? "",
    interview_date: initialData.interview_date ?? "",
    interview_url: initialData.interview_url ?? "",
    interview_type: (initialData.interview_type ?? "") as InterviewType | "",
    // 個人詳細情報
    living_arrangement: (initialData.living_arrangement ?? "") as LivingArrangement | "",
    prefecture: initialData.prefecture ?? "",
    nearest_station: initialData.nearest_station ?? "",
    education: initialData.education ?? "",
    graduation_year: initialData.graduation_year?.toString() ?? "",
    desired_industry: initialData.desired_industry ?? "",
    desired_job_type: initialData.desired_job_type ?? "",
    available_start_date: initialData.available_start_date ?? "",
    admin_notes: initialData.admin_notes ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
    } else {
      setForm((prev) => ({ ...prev, [target.name]: target.value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (createPortal && !form.email) {
      setError("ポータルアカウントを作成するにはメールアドレスが必須です");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      birth_date: form.birth_date || null,
      gender: form.gender || null,
      current_company: form.current_company || null,
      current_salary: form.current_salary ? parseInt(form.current_salary) : null,
      desired_salary: form.desired_salary ? parseInt(form.desired_salary) : null,
      status: form.status,
      ca_id: form.ca_id || null,
      create_portal: createPortal,
      // 流入情報
      source: form.source || null,
      form_type: form.form_type || null,
      ad_identifier: form.ad_identifier || null,
      utm_source: form.utm_source || null,
      utm_medium: form.utm_medium || null,
      utm_campaign: form.utm_campaign || null,
      // LINE連携
      line_registered: form.line_registered,
      line_id: form.line_id || null,
      line_display_name: form.line_display_name || null,
      // 通電・面談管理
      application_date: form.application_date || null,
      application_time: form.application_time || null,
      contact_status: form.contact_status || null,
      contact_notes: form.contact_notes || null,
      interview_date: form.interview_date || null,
      interview_url: form.interview_url || null,
      interview_type: form.interview_type || null,
      // 個人詳細情報
      living_arrangement: form.living_arrangement || null,
      prefecture: form.prefecture || null,
      nearest_station: form.nearest_station || null,
      education: form.education || null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      desired_industry: form.desired_industry || null,
      desired_job_type: form.desired_job_type || null,
      available_start_date: form.available_start_date || null,
      admin_notes: form.admin_notes || null,
    };

    const url =
      mode === "create"
        ? "/api/candidates"
        : `/api/candidates/${initialData.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    // ポータルアカウント作成時はログイン情報を表示
    if (createPortal && json.portal_login_id) {
      setPortalResult({
        email: form.email,
        loginId: json.portal_login_id,
      });
      return;
    }

    router.push(
      mode === "create"
        ? `/admin/candidates/${json.data.id}`
        : `/admin/candidates/${initialData.id}`
    );
    router.refresh();
  }

  function handlePortalResultClose() {
    const id = portalResult ? undefined : undefined;
    setPortalResult(null);
    router.push(`/admin/candidates`);
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 基本情報 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            基本情報
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス {createPortal && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required={createPortal}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="090-0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生年月日
              </label>
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未選択</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 職歴・希望条件 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            職歴・希望条件
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                現在の会社
              </label>
              <input
                type="text"
                name="current_company"
                value={form.current_company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="株式会社〇〇"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                現在の年収（万円）
              </label>
              <input
                type="number"
                name="current_salary"
                value={form.current_salary}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望年収（万円）
              </label>
              <input
                type="number"
                name="desired_salary"
                value={form.desired_salary}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="600"
              />
            </div>
          </div>
        </section>

        {/* 流入情報 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            流入情報
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                流入元
              </label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未選択</option>
                {(Object.entries(SOURCE_LABELS) as [CandidateSource, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                フォーム種類
              </label>
              <select
                name="form_type"
                value={form.form_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未選択</option>
                {(Object.entries(FORM_TYPE_LABELS) as [FormType, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                広告識別子
              </label>
              <input
                type="text"
                name="ad_identifier"
                value={form.ad_identifier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="ad-123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                utm_source
              </label>
              <input
                type="text"
                name="utm_source"
                value={form.utm_source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="google"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                utm_medium
              </label>
              <input
                type="text"
                name="utm_medium"
                value={form.utm_medium}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="cpc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                utm_campaign
              </label>
              <input
                type="text"
                name="utm_campaign"
                value={form.utm_campaign}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="spring_2026"
              />
            </div>
          </div>
        </section>

        {/* LINE連携 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            LINE連携
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="line_registered"
                checked={form.line_registered}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-[#002D37] focus:ring-[#002D37]"
              />
              <span className="text-sm text-gray-700">
                LINE登録済み
              </span>
            </label>

            {form.line_registered && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LINE ID
                  </label>
                  <input
                    type="text"
                    name="line_id"
                    value={form.line_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                    placeholder="U1234567890abcdef1234567890abcd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LINE表示名
                  </label>
                  <input
                    type="text"
                    name="line_display_name"
                    value={form.line_display_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                    placeholder="太郎"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 通電・面談管理 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            通電・面談管理
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                申込日
              </label>
              <input
                type="date"
                name="application_date"
                value={form.application_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                申込牂間
              </label>
              <input
                type="time"
                name="application_time"
                value={form.application_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                通電状況
              </label>
              <select
                name="contact_status"
                value={form.contact_status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未選択</option>
                {(Object.entries(CONTACT_STATUS_LABELS) as [ContactStatus, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                通電メモ
              </label>
              <input
                type="text"
                name="contact_notes"
                value={form.contact_notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="通電結果のメモ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                面談日時
              </label>
              <input
                type="datetime-local"
                name="interview_date"
                value={form.interview_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                面談URL
              </label>
              <input
                type="text"
                name="interview_url"
                value={form.interview_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="https://zoom.us/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                面談形式
              </label>
              <select
                name="interview_type"
                value={form.interview_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未選択</option>
                {(Object.entries(INTERVIEW_TYPE_LABELS) as [InterviewType, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  )
                )}
              </select>
            </div>
          </div>
        </section>

        {/* 個人詳細情報 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            個人詳細情報
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生活形態
              </label>
              <select
                name="living_arrangement"
                value={form.living_arrangement}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未選択</option>
                {(Object.entries(LIVING_ARRANGEMENT_LABELS) as [LivingArrangement, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                都道府県
              </label>
              <select
                name="prefecture"
                value={form.prefecture}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未選択</option>
                {PREFECTURE_OPTIONS.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最寄り駅
              </label>
              <input
                type="text"
                name="nearest_station"
                value={form.nearest_station}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="新宿駅"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最終学歴
              </label>
              <input
                type="text"
                name="education"
                value={form.education}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="大学卒業"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                卒業年
              </label>
              <input
                type="number"
                name="graduation_year"
                value={form.graduation_year}
                onChange={handleChange}
                min={1950}
                max={2100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望業界
              </label>
              <input
                type="text"
                name="desired_industry"
                value={form.desired_industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="IT業界"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望職種
              </label>
              <input
                type="text"
                name="desired_job_type"
                value={form.desired_job_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="エンジニア"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                就業可能日
              </label>
              <input
                type="date"
                name="available_start_date"
                value={form.available_start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                管理者メモ
              </label>
              <textarea
                name="admin_notes"
                value={form.admin_notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="管理者向けのメモを入力"
              />
            </div>
          </div>
        </section>

        {/* 担当・ステータス */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            担当・ステータス
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                {(Object.entries(STATUS_LABELS) as [CandidateStatus, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当CA
              </label>
              <select
                name="ca_id"
                value={form.ca_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">未割り当て</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ポータルアカウント */}
        {mode === "create" && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
              ポータルアカウント
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createPortal}
                onChange={(e) => setCreatePortal(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#002D37] focus:ring-[#002D37]"
              />
              <span className="text-sm text-gray-700">
                ポータルアカウントを同時に作成する
              </span>
            </label>
            {createPortal && (
              <p className="mt-2 text-xs text-gray-500">
                登録完了後にログインID（PT-XXXX形式）が自動生成され、画面に表示されます。メールアドレスとログインIDを求職者にお伝えください。
              </p>
            )}
          </section>
        )}

        {/* 編集モードでportal_login_id表示 */}
        {mode === "edit" && initialData.portal_login_id && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
              ポータルアカウント
            </h2>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-500">ログインID:</span>
                <span className="ml-2 text-sm font-mono font-semibold text-[#002D37]">
                  {initialData.portal_login_id}
                </span>
              </div>
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                initialData.portal_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {initialData.portal_active ? "有効" : "無効"}
              </span>
            </div>
          </section>
        )}

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
            className="px-5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00A645] disabled:opacity-60"
            style={{ backgroundColor: "#00E05D", color: "#002D37" }}
          >
            {loading ? <><Spinner size={16} className="inline mr-1.5" />処理中...</> : mode === "create" ? "登録する" : "更新する"}
          </button>
        </div>
      </form>

      {/* ポータルアカウント作成完了ダイアログ */}
      {portalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#002D37]">
                ポータルアカウントを作成しました
              </h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
              <div>
                <span className="text-xs text-gray-500 block">メールアドレス</span>
                <span className="text-sm font-medium text-[#002D37]">{portalResult.email}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">ログインID（初期パスワード）</span>
                <span className="text-lg font-mono font-bold text-[#002D37] tracking-wider">
                  {portalResult.loginId}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              この情報を求職者にお伝えください。ログインIDは初期パスワードとしても使用されます。この画面を閉じると再表示できません。
            </p>

            <button
              onClick={handlePortalResultClose}
              className="w-full px-4 py-2.5 bg-[#002D37] text-white font-semibold rounded-lg hover:bg-[#003d4d] transition cursor-pointer"
            >
              確認しました
            </button>
          </div>
        </div>
      )}
    </>
  );
}
