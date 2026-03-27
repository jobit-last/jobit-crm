"use client";

import Link from "next/link";
import type { Job } from "@/types/job";

const ACCENT = "#2394FF";
const MINT = "#00B59A";
const GRADIENT_B = "linear-gradient(135deg, #16B1F3, #0649C4)";
const GRADIENT_O = "linear-gradient(135deg, #EE542F, #F67A34, #FFA639)";

export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "応相談";
  if (min && max) return `${(min / 10000).toFixed(0)}〜${(max / 10000).toFixed(0)}万円`;
  if (min) return `${(min / 10000).toFixed(0)}万円〜`;
  return `〜${(max! / 10000).toFixed(0)}万円`;
}

interface Props {
  job: Job;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
  compareMax?: boolean;
}

export default function JobCard({
  job,
  isFavorite,
  onToggleFavorite,
  compareIds = [],
  onToggleCompare,
  compareMax = false,
}: Props) {
  const inCompare = compareIds.includes(job.id);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 flex flex-col hover:shadow-lg transition-shadow group"
      style={{ borderLeft: `4px solid ${ACCENT}` }}
    >
      {/* 企業名 + お気に入り */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-medium truncate" style={{ color: "#16B1F3" }}>
          {job.company_name ?? "企業名未設定"}
        </span>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
          className="shrink-0 text-xl transition-transform hover:scale-110"
        >
          {isFavorite
            ? <span style={{ color: "#FF4D6D" }}>♥</span>
            : <span className="text-gray-200 hover:text-gray-300">♡</span>}
        </button>
      </div>

      {/* タイトル */}
      <h2
        className="text-base font-bold leading-snug mb-3 group-hover:opacity-80 transition-opacity"
        style={{ color: "#21242B" }}
      >
        {job.title}
      </h2>

      {/* バッジ */}
      <div className="flex flex-wrap gap-2 mb-3">
        {job.job_type && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
            style={{ backgroundColor: MINT }}
          >
            {job.job_type}
          </span>
        )}
        {job.location && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: "#E6F7F4", color: MINT }}
          >
            📍 {job.location}
          </span>
        )}
      </div>

      {/* 年収 */}
      <p className="text-sm font-bold mb-4">
        <span
          style={{
            background: GRADIENT_O,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          💰 {formatSalary(job.salary_min, job.salary_max)}
        </span>
      </p>

      <div className="flex-1" />

      {/* ボタン群 */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/portal/jobs/${job.id}`}
          className="block text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 shadow-md"
          style={{ background: GRADIENT_B, minHeight: "44px", lineHeight: "24px" }}
        >
          詳細を見る
        </Link>

        {onToggleCompare && (
          <button
            onClick={() => onToggleCompare(job.id)}
            disabled={!inCompare && compareMax}
            className={`py-2 rounded-xl text-xs font-medium border transition-all ${
              inCompare
                ? "border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100"
                : compareMax
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500"
            }`}
          >
            {inCompare ? "✓ 比較中" : compareMax ? "比較は3件まで" : "+ 比較に追加"}
          </button>
        )}
      </div>
    </div>
  );
}
