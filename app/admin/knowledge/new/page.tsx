"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  KNOWLEDGE_CATEGORIES,
  SELECTION_RESULT_LABELS,
  type KnowledgeCategory,
  type SelectionResult,
} from "@/types/knowledge";
import Spinner from "@/components/Spinner";

const inputClass =
  "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm font-medium text-primary mb-1";

interface CandidateOption {
  id: string;
  name: string;
}
interface CompanyOption {
  id: string;
  name: string;
}

export default function KnowledgeNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  // 求職者・企業の選択肢
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "" as KnowledgeCategory | "",
    tags: [] as string[],
    candidate_id: "",
    company_id: "",
    selection_result: "" as SelectionResult | "",
    result_reason: "",
  });

  // 求職者一覧を取得
  useEffect(() => {
    fetch("/api/candidates?limit=1000")
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data || []).map((c: { id: string; name: string }) => ({
          id: c.id,
          name: c.name,
        }));
        setCandidates(list);
      })
      .catch(() => {});
  }, []);

  // 企業一覧を取得
  useEffect(() => {
    fetch("/api/companies?per_page=1000")
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data || json.companies || []).map((c: { id: string; name: string }) => ({
          id: c.id,
          name: c.name,
        }));
        setCompanies(list);
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const isSelectionResult = form.category === "選考結果";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("タイトルは必須です");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          category: form.category || null,
          tags: form.tags,
          candidate_id: form.candidate_id || null,
          company_id: form.company_id || null,
          selection_result: isSelectionResult && form.selection_result ? form.selection_result : null,
          result_reason: isSelectionResult && form.result_reason ? form.result_reason : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "登録に失敗しました");
        return;
      }
      router.push(`/admin/knowledge/${json.data.id}`);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  // フィルタされた候補
  const filteredCandidates = candidateSearch
    ? candidates.filter((c) => c.name.includes(candidateSearch))
    : candidates;
  const filteredCompanies = companySearch
    ? companies.filter((c) => c.name.includes(companySearch))
    : companies;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/knowledge"
          className="text-sm text-gray-500 hover:text-primary transition-colors"
        >
          &larr; ナレッジ一覧
        </Link>
        <h1 className="text-2xl font-bold text-primary">ナレッジ 新規登録</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* タイトル */}
          <div>
            <label className={labelClass}>
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="ナレッジのタイトルを入力"
              className={inputClass}
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className={labelClass}>カテゴリ</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">未設定</option>
              {KNOWLEDGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 求職者紐づけ */}
          <div>
            <label className={labelClass}>紐づけ求職者</label>
            <input
              type="text"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="求職者名で検索..."
              className={`${inputClass} mb-1`}
            />
            <select
              name="candidate_id"
              value={form.candidate_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">未設定</option>
              {filteredCandidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 企業紐づけ */}
          <div>
            <label className={labelClass}>関連企業</label>
            <input
              type="text"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              placeholder="企業名で検索..."
              className={`${inputClass} mb-1`}
            />
            <select
              name="company_id"
              value={form.company_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">未設定</option>
              {filteredCompanies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 選考結果セクション（カテゴリ=選考結果の場合のみ表示） */}
          {isSelectionResult && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-rose-700">選考結果詳細</h3>

              <div>
                <label className={labelClass}>選考結果タイプ</label>
                <select
                  name="selection_result"
                  value={form.selection_result}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">未設定</option>
                  {(Object.entries(SELECTION_RESULT_LABELS) as [SelectionResult, string][]).map(
                    ([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>理由・要因</label>
                <textarea
                  name="result_reason"
                  value={form.result_reason}
                  onChange={handleChange}
                  rows={4}
                  placeholder="選考結果の理由や要因を記載..."
                  className={`${inputClass} font-mono text-sm`}
                />
              </div>
            </div>
          )}

          {/* タグ */}
          <div>
            <label className={labelClass}>タグ</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="タグを入力してEnterまたは追加"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 text-sm bg-secondary hover:bg-gray-300 text-primary rounded transition-colors"
              >
                追加
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 本文 */}
          <div>
            <label className={labelClass}>本文（マークダウン形式）</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={16}
              placeholder={`## 見出し\n\n本文をマークダウン形式で記入できます。\n\n- リスト1\n- リスト2\n\n**太字** や *斜体* も使えます。`}
              className={`${inputClass} font-mono text-sm`}
            />
            <p className="text-xs text-gray-400 mt-1">マークダウン記法に対応しています</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-cta hover:bg-cta-hover text-primary font-semibold px-8 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {submitting ? <><Spinner size={16} className="inline mr-1.5" />登録中...</> : "登録する"}
          </button>
          <Link
            href="/admin/knowledge"
            className="bg-secondary hover:bg-gray-300 text-primary px-8 py-2 rounded text-sm font-medium transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
