"use client";

import { useState } from "react";
import Link from "next/link";
import Spinner from "@/components/Spinner";

interface MatchResult {
  job_id: string;
  job_title: string;
  company_name: string;
  match_score: number;
  match_reasons: string[];
  concerns: string[];
}

interface MatchResponse {
  success: boolean;
  data: {
    candidate_name: string;
    matches: MatchResult[];
  };
  message?: string;
  error?: string;
}

export default function JobMatchPanel({ candidateId }: { candidateId: string }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);

  const handleMatchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/candidates/${candidateId}/match-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data: MatchResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "マッチング処理に失敗しました");
        return;
      }

      setMatches(data.data.matches);
      setExecuted(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "予期しないエラーが発生しました";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">AIマッチング</h2>

      {!executed && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            候補者のプロフィールとアクティブな求人情報を分析し、最適なマッチング候補を提案します。
          </p>
          <button
            onClick={handleMatchJobs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Spinner size={16} className="inline" />}
            {loading ? "実行中..." : "AIマッチング実行"}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 font-medium">エラー</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          {executed && (
            <button
              onClick={() => {
                setMatches([]);
                setError(null);
                setExecuted(false);
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              再度実行する
            </button>
          )}
        </div>
      )}

      {executed && matches.length === 0 && !error && (
        <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            マッチング対象の求人がありません。
          </p>
          <button
            onClick={() => {
              setMatches([]);
              setError(null);
              setExecuted(false);
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            再度実行する
          </button>
        </div>
      )}

      {executed && matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              マッチング結果 ({matches.length})
            </h3>
            <button
              onClick={() => {
                setMatches([]);
                setError(null);
                setExecuted(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              再度実行する
            </button>
          </div>

          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.job_id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {/* Header with title and score */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">
                      {match.job_title}
                    </h4>
                    <p className="text-sm text-gray-600">{match.company_name}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                        match.match_score
                      )}`}
                    >
                      {match.match_score}点
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mb-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getScoreBarColor(
                      match.match_score
                    )} transition-all`}
                    style={{ width: `${match.match_score}%` }}
                  />
                </div>

                {/* Match reasons */}
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    マッチ理由
                  </h5>
                  <ul className="space-y-1">
                    {match.match_reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <span className="text-green-600 font-medium mr-2">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                {match.concerns.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      懵念事項
                    </h5>
                    <ul className="space-y-1">
                      {match.concerns.map((concern, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-orange-700 bg-orange-50 rounded px-2 py-1"
                        >
                          <span className="font-medium mr-2">⚠</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Job detail link */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/jobs/${match.job_id}`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    求人詳細を見る →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
