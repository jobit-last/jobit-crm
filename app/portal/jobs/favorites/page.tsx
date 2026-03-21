"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import JobCard from "@/app/portal/_components/JobCard";
import { useFavorites, useCompare, COMPARE_MAX } from "@/app/portal/_lib/storage";
import type { Job } from "@/types/job";

const ACCENT = "#2394FF";

export default function FavoritesPage() {
  const { favorites, toggle: toggleFav, getIds } = useFavorites();
  const { compareIds, add: addCompare, remove: removeCompare } = useCompare();
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const compareMax = compareIds.length >= COMPARE_MAX;

  useEffect(() => {
    const ids = getIds();
    if (ids.length === 0) { setLoading(false); return; }

    Promise.all(
      ids.map((id) =>
        fetch(`/api/jobs/${id}`)
          .then((r) => r.json())
          .then((j) => (j.success ? j.data : null))
          .catch(() => null)
      )
    ).then((results) => {
      setJobs(results.filter((j): j is Job => j !== null));
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // お気に入り解除時にリストから除去
  const handleToggleFav = (id: string) => {
    toggleFav(id);
    setJobs((prev) => prev.filter((j) => j.id !== id || favorites.has(id)));
  };

  const handleToggleCompare = (id: string) => {
    compareIds.includes(id) ? removeCompare(id) : addCompare(id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#1A1A2E" }}>
            お気に入り求人
          </h1>
          <p className="text-sm text-gray-400">
            {jobs.length > 0 ? `${jobs.length}件のお気に入り` : ""}
          </p>
        </div>
        {compareIds.length > 0 && (
          <Link
            href="/portal/jobs/compare"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-opacity"
            style={{ backgroundColor: ACCENT }}
          >
            ⚖️ {compareIds.length}件を比較する
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-52 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        /* 空状態 */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center text-gray-400">
          <p className="text-4xl mb-4">♡</p>
          <p className="text-sm mb-2">お気に入りがありません</p>
          <p className="text-xs text-gray-300 mb-6">
            求人一覧でハートアイコンを押してお気に入りに追加できます
          </p>
          <Link
            href="/portal/jobs"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style={{ backgroundColor: ACCENT }}
          >
            求人一覧を見る
          </Link>
        </div>
      ) : (
        <>
          {/* カード一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favorites.has(job.id)}
                onToggleFavorite={() => handleToggleFav(job.id)}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                compareMax={compareMax && !compareIds.includes(job.id)}
              />
            ))}
          </div>

          {/* 一括解除 */}
          <div className="text-center mt-10">
            <p className="text-xs text-gray-400 mb-2">
              ハートアイコンを押すとお気に入りから解除されます
            </p>
            <Link
              href="/portal/jobs/search"
              className="text-sm underline hover:opacity-70"
              style={{ color: ACCENT }}
            >
              他の求人も探す →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
