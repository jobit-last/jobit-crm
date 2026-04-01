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
  const [portalAccount, setPortalAccount] = useState<{
    email: string;
    password: string;
  } | null>(null);

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

  function handleCloseModal() {
    setPortalAccount(null);
    router.push("/admin/candidates");
    router.refresh();
  }

  function handleCopyCredentials() {
    if (!portalAccount) return;
    const text = `ポータルログイン情報\nメール: ${portalAccount.email}\nパスワード: ${portalAccount.password}\nURL: ${window.location.origin}/portal/login`;
    navigator.clipboard.writeText(text);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

    // ポータルアカウントが作成された場合はモーダル表示
    if (mode === "create" && json.portalAccount) {
      setPortalAccount(json.portalAccount);
      return;
    }

    router.push(
      mode === "create"
        ? `/admin/candidates/${json.data.id}`
        : `/admin/candidates/${initialData.id}`
    );
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
                メールアドレス（ポータルログイン用）
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="example@email.com"
              />
              {mode === "create" && (
                <p className="mt-1 text-xs text-blue-600">
                  ※ メールアドレスを入力すると、求職者ポータルのログインアカウントが自動作成されます。
                  登録完了後にパスワードが表示されますのでお控えください。
                </p>
              )}
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

      {/* ポータルアカウント作成完了モーダル */}
      {portalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white">ポータルアカウントが作成されました</h3>
              <p className="text-blue-100 text-sm mt-1">
                以下のログイン情報を求職者にお伝えください
              </p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">ポータルURL</p>
                <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded break-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}/portal/login
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">メールアドレス</p>
                <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded">
                  {portalAccount.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">初期パスワード</p>
                <p className="text-base font-bold font-mono bg-gray-50 px-3 py-2 rounded tracking-wider">
                  {portalAccount.password}
                </p>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                ※ このパスワードは再表示できません。必ず控えてから閉じてください。
              </p>
            </div>
            <div className="px-6 pb-5 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                コピー
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
