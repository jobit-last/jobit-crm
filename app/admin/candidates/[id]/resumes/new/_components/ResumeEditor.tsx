"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ResumeContent } from "@/types/resume";
import { EMPTY_RESUME_CONTENT } from "@/types/resume";
import Spinner from "@/components/Spinner";

interface Props {
  candidateId: string;
  candidateName: string;
}

const SECTIONS: { key: keyof ResumeContent; label: string; rows: number }[] = [
  { key: "summary", label: "自己PR", rows: 6 },
  { key: "work_history", label: "職務経歴", rows: 10 },
  { key: "skills", label: "スキル・技術", rows: 5 },
  { key: "education", label: "学歴", rows: 4 },
  { key: "certifications", label: "資格", rows: 3 },
];

export default function ResumeEditor({ candidateId, candidateName }: Props) {
  const router = useRouter();

  const [content, setContent] = useState<ResumeContent>(EMPTY_RESUME_CONTENT);
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);

  function handleContentChange(key: keyof ResumeContent, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  // ---------- AI 生成 ----------
  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/candidates/${candidateId}/resumes/generate`,
        { method: "POST" }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "AI生成に失敗しました");
        setGenerating(false);
        return;
      }

      setContent(json.content);
      setAiGenerated(true);
    } catch {
      setError("AI生成中にエラーが発生しました");
    }

    setGenerating(false);
  }

  // ---------- 保存 ----------
  async function handleSave() {
    const hasContent = Object.values(content).some((v) => v.trim());
    if (!hasContent) {
      setError("少なくとも1つのセクションを入力してください");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await fetch(`/api/candidates/${candidateId}/resumes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || undefined,
        content,
        is_ai_generated: aiGenerated,
      }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "保存に失敗しました");
      return;
    }

    router.push(`/admin/candidates/${candidateId}/resumes`);
    router.refresh();
  }

  const hasContent = Object.values(content).some((v) => v.trim());

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* AI 生成セクション */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#002D37" }}>
              AI履歴書生成
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {candidateName}さんの登録情報をもとに、AIが履歴書を自動生成します
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-shrink-0 px-5 py-2.5 rounded-md text-sm font-medium text-[#002D37] transition-colors hover:bg-[#00c752] disabled:opacity-60"
            style={{ backgroundColor: "#00E05D" }}
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[#002D37] border-t-transparent rounded-full animate-spin" />
                AI生成中...
              </span>
            ) : (
              "AIで生成する"
            )}
          </button>
        </div>
        {generating && (
          <div className="mt-4 p-4 rounded-md bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700">
              Claude APIを使って履歴書を生成しています。しばらくお待ちください...
            </p>
          </div>
        )}
      </section>

      {/* タイトル */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
          基本設定
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="履歴書（自動でバージョン番号が付きます）"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
          />
        </div>
      </section>

      {/* 各セクション編集 */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
          履歴書内容
          {aiGenerated && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              AI生成済み — 自由に編集できます
            </span>
          )}
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

      {/* 保存ボタン */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !hasContent}
          className="px-5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752] disabled:opacity-60"
          style={{ backgroundColor: "#00E05D", color: "#002D37" }}
        >
          {saving ? <><Spinner size={16} className="inline mr-1.5" />保存中...</> : "履歴書を保存"}
        </button>
      </div>
    </div>
  );
}
