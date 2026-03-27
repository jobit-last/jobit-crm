"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KNOWLEDGE_CATEGORIES, CATEGORY_COLORS, type Knowledge, type KnowledgeCategory } from "@/types/knowledge";

const inputClass =
  "border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function excerpt(text: string | null, len = 100): string {
  if (!text) return "";
  const plain = text.replace(/[#*`>\-\[\]!]/g, "").replace(/\n+/g, " ").trim();
  return plain.length > len ? plain.slice(0, len) + "..." : plain;
}

export default function KnowledgeList() {
  const [items, setItems] = useState<Knowledge[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q)        params.set("q", q);
      if (category) params.set("category", category);
      if (tag)      params.set("tag", tag);
      params.set("page", String(page));
      params.set("per_page", String(perPage));

      const res = await fetch(`/api/knowledge?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setTotal(json.meta.total);
      }
    } finally {
      setLoading(false);
    }
  }, [q, category, tag, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">ナレッジ管理</h1>
          <p className="text-sm text-gray-500 mt-1">全 {total} 件</p>
        </div>
        <Link
          href="/admin/knowledge/new"
          className="bg-cta hover:bg-cta-hover text-primary font-semibold px-5 py-2 rounded text-sm transition-colors"
        >
          + 新規登録
        </Link>
      </div>

      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="タイトルで検索..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className={`${inputClass} flex-1 min-w-48`}
          />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className={`${inputClass} w-44`}
          >
            <option value="">全カテゴリ</option>
            {KNOWLEDGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="タグで検索..."
            value={tag}
            onChange={(e) => { setTag(e.target.value); setPage(1); }}
            className={`${inputClass} w-36`}
          />
          <button
            type="submit"
            className="bg-cta hover:bg-cta-hover text-primary font-semibold px-5 py-2 rounded text-sm transition-colors"
          >
            検索
          </button>
        </div>
      </form>

      {/* カード一覧 */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          読み込み中...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm gap-3">
          <span>ナレッジが見つかりません</span>
          <Link href="/admin/knowledge/new" className="text-accent underline text-sm">
            最初のナレッジを登録する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/knowledge/${item.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-accent/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="text-base font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {item.title}
                </h2>
                {item.category && (
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category as KnowledgeCategory]}`}>
                    {item.category}
                  </span>
                )}
              </div>

              {item.content && (
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                  {excerpt(item.content)}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                  {item.tags.length > 4 && (
                    <span className="text-xs text-gray-400">+{item.tags.length - 4}</span>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400">{formatDate(item.updated_at)} 更新</p>
            </Link>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
