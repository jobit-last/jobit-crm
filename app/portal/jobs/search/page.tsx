"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import JobCard from "@/app/portal/_components/JobCard";
import { useFavorites, useCompare, COMPARE_MAX } from "@/app/portal/_lib/storage";
import type { Job } from "@/types/job";

const ACCENT = "#2394FF";

const SALARY_OPTIONS = [
  { label: "指定なし", value: "" },
  { label: "300万円以上", value: "3000000" },
  { label: "400万円以上", value: "4000000" },
  { label: "500万円以上", value: "5000000" },
  { label: "600万円以上", value: "6000000" },
  { label: "700万円以上", value: "7000000" },
  { label: "800万円以上", value: "8000000" },
];

export default function SearchPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage]       = useState(1);
  const perPage = 12;

  const [keyword,    setKeyword]    = useState("");
  const [jobType,    setJobType]    = useState("");
  const [location,   setLocation]   = useState("");
  const [salaryMin,  setSalaryMin]  = useState("");

  const { favorites, toggle: toggleFav } = useFavorites();
  const { compareIds, add: addCompare, remove: removeCompare } = useCompare();
  const compareMax = compareIds.length >= COMPARE_MAX;

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ is_published: "true", page: String(p), per_page: String(perPage) });
      if (keyword)   params.set("keyword",    keyword);
      if (jobType)   params.set("job_type",   jobType);
      if (location)  params.set("location",   location);
      if (salaryMin) params.set("salary_min", salaryMin);

      const res  = await fetch(`/api/jobs?${params}`);
      const json = await res.json();
      if (json.success) { setJobs(json.data); setTotal(json.meta.total); }
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [keyword, jobType, location, salaryMin]);

  // 初回ロード
  useEffect(() => { fetchJobs(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs(1);
  };

  const handleReset = () => {
    setKeyword(""); setJobType(""); setLocation(""); setSalaryMin("");
    setPage(1);
  };

  const handleToggleCompare = (id: string) => {
    compareIds.includes(id) ? removeCompare(id) : addCompare(id);
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#21242B" }}>求人検索</h1>
        <p className="text-sm text-gray-400">条件を絞って理想の求人を見つけましょう</p>
      </div>

      {/* 検索フォーム */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* キーワード */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">キーワード</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="職種名・スキルなど自由に入力"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
            />
          </div>

          {/* 職種 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">職種</label>
            <input
              type="text"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              placeholder="例: エンジニア、営業、デザイナー"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
            />
          </div>

          {/* 勤務地 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">勤務地</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例: 東京、大阪、リモート"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
            />
          </div>

          {/* 年収下限 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">年収（下限）</label>
            <select
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
              style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
            >
              {SALARY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
          >
            検索する
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            リセット
          </button>
        </div>
      </form>

      {/* 比較バナー */}
      {compareIds.length > 0 && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 mb-6 text-white text-sm"
          style={{ backgroundColor: ACCENT }}
        >
          <span>{compareIds.length}件を比較リストに追加中</span>
          <Link
            href="/portal/jobs/compare"
            className="font-semibold bg-white rounded-lg px-4 py-1.5 hover:opacity-80 transition-opacity"
            style={{ color: ACCENT }}
          >
            比較する →
          </Link>
        </div>
      )}

      {/* 結果 */}
      {searched && (
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-semibold" style={{ color: "#21242B" }}>{total}</span> 件見つかりました
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : jobs.length === 0 && searched ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">条件に合う求人が見つかりませんでした</p>
          <button
            onClick={handleReset}
            className="mt-4 text-sm underline"
            style={{ color: ACCENT }}
          >
            条件をリセット
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isFavorite={favorites.has(job.id)}
              onToggleFavorite={() => toggleFav(job.id)}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
              compareMax={compareMax && !compareIds.includes(job.id)}
            />
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => { setPage((p) => p - 1); fetchJobs(page - 1); }}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← 前へ
          </button>
          <span className="text-sm text-gray-500 px-2">{page} / {totalPages}</span>
          <button
            onClick={() => { setPage((p) => p + 1); fetchJobs(page + 1); }}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}
