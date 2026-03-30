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
  { value: "male", label: "ç·æ§" },
  { value: "female", label: "å¥³æ§" },
  { value: "other", label: "ãã®ä»" },
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
      setError(json.error ?? "ã¨ã©ã¼ãçºçãã¾ãã");
      return;
    }

    // æ°è¦ä½ææã«ãã¼ã¿ã«ã¢ã«ã¦ã³ããçºè¡ãããå ´åãã¢ã¼ãã«è¡¨ç¤º
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

  function handleCloseModal() {
    setPortalAccount(null);
    router.push("/admin/candidates");
    router.refresh();
  }

  function handleCopyCredentials() {
    if (!portalAccount) return;
    const text = `ãã¼ã¿ã«ã­ã°ã¤ã³æå ±\nã¡ã¼ã«: ${portalAccount.email}\nãã¹ã¯ã¼ã: ${portalAccount.password}\nURL: ${window.location.origin}/portal/login`;
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* åºæ¬æå ± */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            åºæ¬æå ±
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                æ°å <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="å±±ç° å¤ªé"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ã¡ã¼ã«ã¢ãã¬ã¹
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
                  â» ã¡ã¼ã«ã¢ãã¬ã¹ãå¥åããã¨ããã¼ã¿ã«ãµã¤ãã®ã­ã°ã¤ã³ã¢ã«ã¦ã³ããèªåä½æããã¾ã
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                é»è©±çªå·
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
                çå¹´ææ¥
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
              <label className="block text-sm font-medium text-gray-700 mb-1">æ§å¥</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">æªé¸æ</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* è·æ­´ã»å¸ææ¡ä»¶ */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            è·æ­´ã»å¸ææ¡ä»¶
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ç¾å¨ã®ä¼ç¤¾
              </label>
              <input
                type="text"
                name="current_company"
                value={form.current_company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
                placeholder="æ ªå¼ä¼ç¤¾ãã"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ç¾å¨ã®å¹´åï¼ä¸åï¼
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
                å¸æå¹´åï¼ä¸åï¼
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

        {/* æå½ã»ã¹ãã¼ã¿ã¹ */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
            æå½ã»ã¹ãã¼ã¿ã¹
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ã¹ãã¼ã¿ã¹ <span className="text-red-500">*</span>
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
                æå½CA
              </label>
              <select
                name="ca_id"
                value={form.ca_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              >
                <option value="">æªå²ãå½ã¦</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ãã¿ã³ */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ã­ã£ã³ã»ã«
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00A645] disabled:opacity-60"
            style={{ backgroundColor: "#00E05D", color: "#002D37" }}
          >
            {loading ? <><Spinner size={16} className="inline mr-1.5" />å¦çä¸­...</> : mode === "create" ? "ç»é²ãã" : "æ´æ°ãã"}
          </button>
        </div>
      </form>

      {/* ãã¼ã¿ã«ã¢ã«ã¦ã³ãä½æå®äºã¢ã¼ãã« */}
      {portalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div
              className="px-6 py-4"
              style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
            >
              <h3 className="text-lg font-bold text-white">
                ãã¼ã¿ã«ã¢ã«ã¦ã³ãä½æå®äº
              </h3>
              <p className="text-sm text-white/80 mt-1">
                æ±è·èã«ä»¥ä¸ã®ã­ã°ã¤ã³æå ±ããç¥ãããã ãã
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">ã­ã°ã¤ã³URL</p>
                  <p className="text-sm font-mono text-gray-800">
                    {typeof window !== "undefined" ? window.location.origin : ""}/portal/login
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">ã¡ã¼ã«ã¢ãã¬ã¹</p>
                  <p className="text-sm font-mono text-gray-800">{portalAccount.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">åæãã¹ã¯ã¼ã</p>
                  <p className="text-lg font-mono font-bold tracking-wider" style={{ color: "#0649C4" }}>
                    {portalAccount.password}
                  </p>
                </div>
              </div>

              <p className="text-xs text-red-500">
                â» ãã®ãã¹ã¯ã¼ãã¯åè¡¨ç¤ºã§ãã¾ãããå¿ãæ§ãã¦ãã ããã
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleCopyCredentials}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                ã³ãã¼
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer"
                style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
              >
                éãã
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
