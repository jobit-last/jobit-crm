"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resume, ResumeContent } from "@/types/resume";

interface Props {
  candidateId: string;
  resume: Resume;
}

const SECTIONS: { key: keyof ResumeContent; label: string; rows: number }[] = [
  { key: "summary", label: "自己PR", rows: 6 },
  { key: "work_history", label: "職務経歴", rows: 10 },
  { key: "skills", label: "スキル・技術", rows: 5 },
  { key: "education", label: "学歴", rows: 4 },
  { key: "certifications", label: "資格", rows: 3 },
];

export default function ResumeEditClient({ candidateId, resume }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(resume.title);
  const [content, setContent] = useState<ResumeContent>(resume.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleContentChange(key: keyof ResumeContent, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch(
      `/api/candidates/${candidateId}/resumes/${resume.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      }
    );

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "保存に失敗しました");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  function handleDownloadPdf() {
    window.open(
      `/api/candidates/${candidateId}/resumes/${resume.id}/pdf`,
      "_blank"
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-700">
          保存しました
        </div>
      )}

      {/* 基本設定 */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "#002D37" }}>
            基本設定
          </h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              v{resume.version}
            </span>
            {resume.is_ai_generated && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                AI生成
              </span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
          />
        </div>
      </section>

      {/* 各セクション編集 */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
          履歴書内容
        </h2>
        <div className="space-y-5">
          {SECTIONS.map(({ key, label, rows }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <textarea
                value={content[key]}
                onChange={(e) => handleContentChange(key, e.target.value)}
                rows={rows}
                placeholder={`${label}を入力...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ボタン */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleDownloadPdf}
          className="px-5 py-2 rounded-md text-sm font-medium border transition-colors"
          style={{ borderColor: "#002D37", color: "#002D37" }}
        >
          PDF出力
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/candidates/${candidateId}/resumes`)}
            className="px-5 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752] disabled:opacity-60"
            style={{ backgroundColor: "#00E05D", color: "#002D37" }}
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
