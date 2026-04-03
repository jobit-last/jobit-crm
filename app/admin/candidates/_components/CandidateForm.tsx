"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Candidate, Advisor, CandidateStatus, Gender } from "@/types/candidate";
import { STATUS_LABELS } from "@/types/candidate";
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
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
