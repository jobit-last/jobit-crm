"use client";

import { useState, useEffect, useCallback } from "react";
import FunnelChart from "./FunnelChart";
import CaPerformanceChart from "./CaPerformanceChart";

const PERIODS = [
  { value: "this_month", label: "今月" },
  { value: "last_month", label: "先月" },
  { value: "3_months",   label: "3ヶ月" },
  { value: "6_months",   label: "半年" },
] as const;

type Period = typeof PERIODS[number]["value"];

interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
}

interface CaPerformance {
  ca: string;
  total: number;
  interviewed: number;
  applied: number;
  in_selection: number;
  offered: number;
  placed: number;
  interview_to_selection_rate: number;
  overall_rate: number;
}

export default function AnalyticsClient() {
  const [period, setPeriod] = useState<Period>("this_month");
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [overallRate, setOverallRate] = useState(0);
  const [total, setTotal] = useState(0);
  const [caPerformance, setCaPerformance] = useState<CaPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const [funnelRes, caRes] = await Promise.all([
        fetch(`/api/analytics/funnel?period=${p}`),
        fetch(`/api/analytics/ca-performance?period=${p}`),
      ]);
      const funnelJson = await funnelRes.json();
      const caJson = await caRes.json();

      if (funnelJson.success) {
        setFunnel(funnelJson.data.funnel);
        setOverallRate(funnelJson.data.overall_rate);
        setTotal(funnelJson.data.total);
      }
      if (caJson.success) {
        setCaPerformance(caJson.data.ca_performance);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  return (
    <div className="space-y-6">
      {/* ヘッダー + 期間フィルター */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">歩留まり分析</h1>
          <p className="text-sm text-gray-500 mt-1">求職者のステージ別転換率</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === value
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          読み込み中...
        </div>
      ) : (
        <>
          {/* サマリーカード */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">期間内登録数</p>
              <p className="text-3xl font-bold text-primary mt-1">{total}<span className="text-base font-normal text-gray-400 ml-1">名</span></p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">総合歩留まり率（登録→入社）</p>
              <p className="text-3xl font-bold text-primary mt-1">{overallRate}<span className="text-base font-normal text-gray-400 ml-1">%</span></p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">入社数</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {funnel.find((s) => s.stage === "入社")?.count ?? 0}
                <span className="text-base font-normal text-gray-400 ml-1">名</span>
              </p>
            </div>
          </div>

          {/* ファネルチャート */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">ファネル（ステージ別転換率）</h2>
            <FunnelChart data={funnel} />
            {/* ステージ転換率 */}
            <div className="mt-4 flex flex-wrap gap-3">
              {funnel.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{s.stage}</span>
                  <span>{s.count}名</span>
                  {i > 0 && <span className="text-gray-300">({s.rate}%)</span>}
                </div>
              ))}
            </div>
          </div>

          {/* CA別パフォーマンス */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">CA別パフォーマンス</h2>
            <CaPerformanceChart data={caPerformance} />
          </div>
        </>
      )}
    </div>
  );
}
