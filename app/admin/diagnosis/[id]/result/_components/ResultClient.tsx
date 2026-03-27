"use client";

import { useState, useEffect } from "react";
import type { DiagnosisHearing } from "@/types/diagnosis";
import type { DiagnosisResult } from "@/app/api/diagnosis/analyze/route";
import PdfPanel from "./PdfPanel";

// ── Score Gauge (SVG arc) ────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const strokeWidth = 16;
  // Arc spans 240° (from 150° to 390°)
  const startAngle = 150;
  const totalAngle = 240;
  const endAngle = startAngle + (totalAngle * score) / 100;

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(from: number, to: number) {
    const s = polar(from);
    const e = polar(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const scoreColor =
    score >= 80 ? "#00E05D" : score >= 60 ? "#00A0B0" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <path
          d={arcPath(startAngle, startAngle + totalAngle)}
          fill="none"
          stroke="#BFCED1"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {score > 0 && (
          <path
            d={arcPath(startAngle, endAngle)}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* Score text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="36" fontWeight="700" fill="#1A1A2E">
          {score}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize="14" fill="#6B7280">
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold mt-1" style={{ color: scoreColor }}>
        {score >= 80
          ? "非常に高い市場価値"
          : score >= 60
          ? "高い市場価値"
          : score >= 40
          ? "標準的な市場価値"
          : "成長の余地あり"}
      </span>
    </div>
  );
}

// ── Salary Bar ───────────────────────────────────────────────────────────────
function SalaryBar({
  min,
  max,
  current,
}: {
  min: number;
  max: number;
  current: number | null;
}) {
  const base = Math.min(current ?? min, min) * 0.85;
  const cap = max * 1.15;
  const range = cap - base;
  const barLeft = ((min - base) / range) * 100;
  const barWidth = ((max - min) / range) * 100;
  const currentLeft = current ? ((current - base) / range) * 100 : null;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1" style={{ color: "#6B7280" }}>
        <span>{min}万円</span>
        <span>{max}万円</span>
      </div>
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        {/* Salary range bar */}
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${barLeft}%`,
            width: `${barWidth}%`,
            backgroundColor: "#00A0B0",
            opacity: 0.7,
          }}
        />
        {/* Current salary marker */}
        {currentLeft !== null && (
          <div
            className="absolute top-1 bottom-1 w-1 rounded-full bg-amber-400"
            style={{ left: `${Math.min(Math.max(currentLeft, 1), 97)}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs mt-2" style={{ color: "#6B7280" }}>
        <span>
          想定レンジ:{" "}
          <strong style={{ color: "#00A0B0" }}>
            {min}〜{max}万円
          </strong>
        </span>
        {current && (
          <span>
            現在:{" "}
            <strong style={{ color: "#F59E0B" }}>{current}万円</strong>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
interface Props {
  hearing: DiagnosisHearing;
}

export default function ResultClient({ hearing }: Props) {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // If analysis_result is already stored in the hearing, use it
        const stored = (hearing as DiagnosisHearing & { analysis_result?: DiagnosisResult })
          .analysis_result;
        if (stored) {
          setResult(stored);
          setResultSaved(true);
          setLoading(false);
          return;
        }

        // Otherwise call Claude API
        const res = await fetch("/api/diagnosis/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hearing),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");

        setResult(json.result);

        // Save result to Supabase for future use (PDF generation etc.)
        await fetch(`/api/diagnosis/${hearing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result: json.result }),
        }).then(() => setResultSaved(true));
      } catch (e) {
        setError(e instanceof Error ? e.message : "不明なエラー");
      } finally {
        setLoading(false);
      }
    })();
  }, [hearing]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#002D37", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#6B7280" }}>
          AIが市場価値を分析中です…
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-sm">{error ?? "分析結果を取得できませんでした"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── PDF Panel ── */}
      {resultSaved && <PdfPanel hearingId={hearing.id} candidateName={hearing.name} />}

      {/* ── Top row: Score + Salary ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Score */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center">
          <h2 className="text-sm font-semibold mb-4 self-start" style={{ color: "#1A1A2E" }}>
            市場価値スコア
          </h2>
          <ScoreGauge score={result.score} />
        </div>

        {/* Salary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#1A1A2E" }}>
            想定年収レンジ
          </h2>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold" style={{ color: "#002D37" }}>
              {result.salary_min}
            </span>
            <span className="text-lg" style={{ color: "#6B7280" }}>
              〜
            </span>
            <span className="text-3xl font-bold" style={{ color: "#002D37" }}>
              {result.salary_max}
            </span>
            <span className="text-sm" style={{ color: "#6B7280" }}>
              万円
            </span>
          </div>
          <SalaryBar
            min={result.salary_min}
            max={result.salary_max}
            current={hearing.current_salary}
          />
        </div>
      </div>

      {/* ── Strengths & Gaps ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Strengths */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
              style={{ backgroundColor: "#00E05D" }}
            >
              ✓
            </span>
            強み・スキル
          </h2>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#1A1A2E" }}>
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#00E05D" }} />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
              style={{ backgroundColor: "#F59E0B" }}
            >
              !
            </span>
            不足スキル・強化ポイント
          </h2>
          <ul className="space-y-2">
            {result.gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#1A1A2E" }}>
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-400" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Recommended Jobs ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "#1A1A2E" }}>
          おすすめ職種
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {result.recommended_jobs.map((job, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 p-4"
              style={{ backgroundColor: "#F0F9FA" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: "#002D37" }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-semibold" style={{ color: "#002D37" }}>
                  {job.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                {job.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Career Advice ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "#1A1A2E" }}>
          キャリアアドバイス
        </h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>
          {result.career_advice}
        </p>
      </div>

      {/* ── CTA ── */}
      <div className="flex items-center justify-between pb-8">
        <a
          href="/admin/diagnosis/new"
          className="px-5 py-2.5 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          別の診断を行う
        </a>
        <a
          href="/admin/candidates"
          className="px-6 py-2.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#00E05D", color: "#1A1A2E" }}
        >
          求職者一覧へ戻る
        </a>
      </div>
    </div>
  );
}
