"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  KNOWLEDGE_CATEGORIES,
  CATEGORY_COLORS,
  type Knowledge,
  type KnowledgeCategory,
} from "@/types/knowledge";

const inputClass =
  "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm font-medium text-primary mb-1";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KnowledgeDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "" as KnowledgeCategory | "",
    tags: [] as string[],
  });

  const fetchKnowledge = useCallback(async () => {
    try {
      const res = await fetch(`/api/knowledge/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError("ナレッジの取得に失敗しました");
        return;
      }
      const k: Knowledge = json.data;
      setKnowledge(k);
      setForm({
        title: k.title,
        content: k.content || "",
        category: (k.category as KnowledgeCategory) || "",
        tags: k.tags || [],
      });
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("タイトルは必須です");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          category: form.category || null,
          tags: form.tags,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "更新に失敗しました");
        return;
      }
      setKnowledge(json.data);
      setEditing(false);
      setPreview(false);
      setSuccessMsg("更新しました");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${knowledge?.title}」を削除してもよろしいですか？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "削除に失敗しました");
        return;
      }
      router.push("/admin/knowledge");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (knowledge) {
      setForm({
        title: knowledge.title,
        content: knowledge.content || "",
        category: (knowledge.category as KnowledgeCategory) || "",
        tags: knowledge.tags || [],
      });
    }
    setEditing(false);
    setPreview(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  if (!knowledge && !loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">ナレッジが見つかりません</p>
        <Link href="/admin/knowledge" className="text-accent underline text-sm">ナレッジ一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/knowledge"
            className="shrink-0 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            ← 一覧
          </Link>
          {!editing && (
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-primary truncate">{knowledge?.title}</h1>
                {knowledge?.category && (
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[knowledge.category as KnowledgeCategory]}`}>
                    {knowledge.category}
                  </span>
                )}
              </div>
              {knowledge?.tags && knowledge.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {knowledge.tags.map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {editing && (
            <h1 className="text-xl font-bold text-primary">ナレッジ編集</h1>
          )}
        </div>

        {!editing && (
          <div className="flex shrink-0 gap-2">
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
              {deleting ? "削除中..." : "削除"}
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

      {/* 表示モード */}
      {!editing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {knowledge?.content ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{knowledge.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">本文がありません</p>
          )}
          {knowledge && (
            <div className="pt-4 mt-4 border-t border-gray-100 text-xs text-gray-400 space-y-0.5">
              <p>登録日: {formatDate(knowledge.created_at)}</p>
              <p>更新日: {formatDate(knowledge.updated_at)}</p>
            </div>
          )}
        </div>
      )}

      {/* 編集モード */}
      {editing && (
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
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

            {/* タグ */}
            <div>
              <label className={labelClass}>タグ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Enterで追加"
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
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 本文（エディタ ↔ プレビュー切り替え） */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>本文（マークダウン形式）</label>
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="text-xs text-accent hover:underline"
                >
                  {preview ? "エディタに戻す" : "プレビュー"}
                </button>
              </div>
              {preview ? (
                <div className="border border-secondary rounded p-4 min-h-48 prose prose-sm max-w-none text-gray-700 bg-gray-50">
                  {form.content ? (
                    <ReactMarkdown>{form.content}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400 text-sm">本文がありません</p>
                  )}
                </div>
              ) : (
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={16}
                  className={`${inputClass} font-mono text-sm`}
                />
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="bg-cta hover:bg-cta-hover text-primary font-semibold px-8 py-2 rounded text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "保存中..." : "保存する"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-secondary hover:bg-gray-300 text-primary px-8 py-2 rounded text-sm font-medium transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
