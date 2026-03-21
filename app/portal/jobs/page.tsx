"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Job } from "@/types/job";

const ACCENT = "#2394FF";

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "応相談";
  if (min && max) return `${(min / 10000).toFixed(0)}〜${(max / 10000).toFixed(0)}万円`;
  if (min) return `${(min / 10000).toFixed(0)}万円〜`;
  return `〜${(max! / 10000).toFixed(0)}万円`;
}

function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("portal_favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("portal_favorites", JSON.stringify([...next]));
      return next;
    });
  };

  return { favorites, toggle };
}

export default function PortalJobsPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [keyword, setKeyword] = useState("");
  const [inputKw, setInputKw] = useState("");
  const { favorites, toggle } = useFavorites();
  const perPage = 12;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        is_published: "true",
        page:         String(page),
        per_page:     String(perPage),
      });
      if (keyword) params.set("keyword", keyword);

      const res  = await fetch(`/api/jobs?${params}`);
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
        setTotal(json.meta.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(inputKw);
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* ヒーロー */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A2E" }}>
          あなたにぴったりの求人
        </h1>
        <p className="text-gray-500 text-sm">担当CAが厳選した求人をご紹介します</p>
      </div>

      {/* 検索バー */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <input
            type="text"
            value={inputKw}
            onChange={(e) => setInputKw(e.target.value)}
            placeholder="職種・キーワードで検索..."
            className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: ACCENT }}
          >
            検索
          </button>
        </div>
      </form>

      {/* 件数 */}
      <p className="text-sm text-gray-500 mb-4">
        {keyword ? `「${keyword}」の検索結果: ` : ""}
        <span className="font-semibold" style={{ color: "#1A1A2E" }}>{total}</span> 件
      </p>

      {/* カード一覧 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded mb-3 w-1/3" />
              <div className="h-5 bg-gray-100 rounded mb-4 w-3/4" />
              <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">求人が見つかりませんでした</p>
          {keyword && (
            <button
              onClick={() => { setInputKw(""); setKeyword(""); setPage(1); }}
              className="mt-4 text-sm underline"
              style={{ color: ACCENT }}
            >
              検索をリセット
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isFavorite={favorites.has(job.id)}
              onToggleFavorite={() => toggle(job.id)}
            />
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← 前へ
          </button>
          <span className="text-sm text-gray-500 px-2">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}

function JobCard({
  job,
  isFavorite,
  onToggleFavorite,
}: {
  job: Job;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow group">
      {/* 企業名 + お気に入り */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs text-gray-400 font-medium truncate">
          {job.company_name ?? "企業名未設定"}
        </span>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
          className="shrink-0 text-xl transition-transform hover:scale-110"
        >
          {isFavorite ? (
            <span style={{ color: "#FF4D6D" }}>♥</span>
          ) : (
            <span className="text-gray-200 hover:text-gray-300">♡</span>
          )}
        </button>
      </div>

      {/* 職種タイトル */}
      <h2
        className="text-base font-bold leading-snug mb-3 group-hover:opacity-80 transition-opacity"
        style={{ color: "#1A1A2E" }}
      >
        {job.title}
      </h2>

      {/* 情報バッジ */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.job_type && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: "#EBF4FF", color: ACCENT }}
          >
            {job.job_type}
          </span>
        )}
        {job.location && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
            📍 {job.location}
          </span>
        )}
      </div>

      {/* 年収 */}
      <p className="text-sm font-semibold mb-4" style={{ color: ACCENT }}>
        💰 {formatSalary(job.salary_min, job.salary_max)}
      </p>

      {/* スペーサー */}
      <div className="flex-1" />

      {/* ボタン */}
      <Link
        href={`/portal/jobs/${job.id}`}
        className="block text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
        style={{ backgroundColor: ACCENT }}
      >
        詳細を見る
      </Link>
    </div>
  );
}
