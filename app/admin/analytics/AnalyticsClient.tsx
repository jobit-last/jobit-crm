"use client";

import { useState, useEffect, useCallback } from "react";
import FunnelChart from "./FunnelChart";

const PERIODS = [
  { value: "this_month", label: "今月" },
  { value: "last_month", label: "先月" },
  { value: "3_months", label: "3ヶ月" },
  { value: "6_months", label: "半年" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

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

/* ---------- ヘルパー ---------- */
function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "—";
  return (Math.round((numerator / denominator) * 1000) / 10).toFixed(1) + "%";
}

function rateColor(rate: string): string {
  if (rate === "—") return "text-gray-400";
  const n = parseFloat(rate);
  if (n >= 70) return "text-green-600";
  if (n >= 40) return "text-yellow-600";
  return "text-red-500";
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

  /* ---------- 全CA合計 ---------- */
  const totals = caPerformance.reduce(
    (acc, ca) => ({
      total: acc.total + ca.total,
      interviewed: acc.interviewed + ca.interviewed,
      applied: acc.applied + ca.applied,
      in_selection: acc.in_selection + ca.in_selection,
      offered: acc.offered + ca.offered,
      placed: acc.placed + ca.placed,
    }),
    { total: 0, interviewed: 0, applied: 0, in_selection: 0, offered: 0, placed: 0 }
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー + 期間フィルター */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">歩留まり分析</h1>
          <p className="text-sm text-gray-500 mt-1">
            求職者のステージ別転換率
          </p>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">登録数</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {total}
                <span className="text-base font-normal text-gray-400 ml-1">名</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">面談実施数</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {funnel.find((s) => s.stage === "面談")?.count ?? 0}
                <span className="text-base font-normal text-gray-400 ml-1">名</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">入社数</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {funnel.find((s) => s.stage === "入社")?.count ?? 0}
                <span className="text-base font-normal text-gray-400 ml-1">名</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">総合歩留まり率</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {overallRate}
                <span className="text-base font-normal text-gray-400 ml-1">%</span>
              </p>
            </div>
          </div>

          {/* ファネルチャート */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              全体ファネル（ステージ別転換率）
            </h2>
            <FunnelChart data={funnel} />
            <div className="mt-4 flex flex-wrap gap-3">
              {funnel.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-gray-500"
                >
                  <span className="font-medium text-gray-700">{s.stage}</span>
                  <span>{s.count}名</span>
                  {i > 0 && (
                    <span className="text-gray-300">({s.rate}%)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ===== CA別 詳細歩留まりテーブル ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              CA別 歩留まり詳細
            </h2>

            {caPerformance.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">
                データがありません
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 whitespace-nowrap bg-gray-50 sticky left-0 z-10">
                        担当CA
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 whitespace-nowrap">
                        登録
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 whitespace-nowrap">
                        面談
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-blue-600 whitespace-nowrap bg-blue-50">
                        面談率
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 whitespace-nowrap">
                        応募
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-blue-600 whitespace-nowrap bg-blue-50">
                        応募率
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 whitespace-nowrap">
                        面接
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-blue-600 whitespace-nowrap bg-blue-50">
                        面接率
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 whitespace-nowrap">
                        内定
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-blue-600 whitespace-nowrap bg-blue-50">
                        内定率
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 whitespace-nowrap">
                        入社
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-green-700 whitespace-nowrap bg-green-50">
                        歩留まり率
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {caPerformance.map((ca, idx) => {
                      const interviewRate = pct(ca.interviewed, ca.total);
                      const applyRate = pct(ca.applied, ca.interviewed);
                      const selectionRate = pct(ca.in_selection, ca.applied);
                      const offerRate = pct(ca.offered, ca.in_selection);
                      const overallR = pct(ca.placed, ca.total);
                      return (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-2 font-medium text-gray-800 whitespace-nowrap bg-white sticky left-0 z-10">
                            {ca.ca}
                          </td>
                          <td className="text-center py-3 px-2 font-semibold">
                            {ca.total}
                          </td>
                          <td className="text-center py-3 px-2">
                            {ca.interviewed}
                          </td>
                          <td className={`text-center py-3 px-2 font-medium bg-blue-50 ${rateColor(interviewRate)}`}>
                            {interviewRate}
                          </td>
                          <td className="text-center py-3 px-2">
                            {ca.applied}
                          </td>
                          <td className={`text-center py-3 px-2 font-medium bg-blue-50 ${rateColor(applyRate)}`}>
                            {applyRate}
                          </td>
                          <td className="text-center py-3 px-2">
                            {ca.in_selection}
                          </td>
                          <td className={`text-center py-3 px-2 font-medium bg-blue-50 ${rateColor(selectionRate)}`}>
                            {selectionRate}
                          </td>
                          <td className="text-center py-3 px-2">
                            {ca.offered}
                          </td>
                          <td className={`text-center py-3 px-2 font-medium bg-blue-50 ${rateColor(offerRate)}`}>
                            {offerRate}
                          </td>
                          <td className="text-center py-3 px-2 font-semibold">
                            {ca.placed}
                          </td>
                          <td className={`text-center py-3 px-2 font-bold bg-green-50 ${rateColor(overallR)}`}>
                            {overallR}
                          </td>
                        </tr>
                      );
                    })}

                    {/* 合計行 */}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="py-3 px-2 text-gray-800 whitespace-nowrap bg-gray-50 sticky left-0 z-10">
                        合計
                      </td>
                      <td className="text-center py-3 px-2">{totals.total}</td>
                      <td className="text-center py-3 px-2">{totals.interviewed}</td>
                      <td className={`text-center py-3 px-2 bg-blue-50 ${rateColor(pct(totals.interviewed, totals.total))}`}>
                        {pct(totals.interviewed, totals.total)}
                      </td>
                      <td className="text-center py-3 px-2">{totals.applied}</td>
                      <td className={`text-center py-3 px-2 bg-blue-50 ${rateColor(pct(totals.applied, totals.interviewed))}`}>
                        {pct(totals.applied, totals.interviewed)}
                      </td>
                      <td className="text-center py-3 px-2">{totals.in_selection}</td>
                      <td className={`text-center py-3 px-2 bg-blue-50 ${rateColor(pct(totals.in_selection, totals.applied))}`}>
                        {pct(totals.in_selection, totals.applied)}
                      </td>
                      <td className="text-center py-3 px-2">{totals.offered}</td>
                      <td className={`text-center py-3 px-2 bg-blue-50 ${rateColor(pct(totals.offered, totals.in_selection))}`}>
                        {pct(totals.offered, totals.in_selection)}
                      </td>
                      <td className="text-center py-3 px-2">{totals.placed}</td>
                      <td className={`text-center py-3 px-2 bg-green-50 ${rateColor(pct(totals.placed, totals.total))}`}>
                        {pct(totals.placed, totals.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ===== CA別 個別カード ===== */}
          {caPerformance.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-700">
                CA別 個別レポート
              </h2>
              {caPerformance.map((ca, idx) => {
                const stages = [
                  { label: "登録", count: ca.total, prev: 0 },
                  { label: "面談", count: ca.interviewed, prev: ca.total },
                  { label: "応募", count: ca.applied, prev: ca.interviewed },
                  { label: "面接", count: ca.in_selection, prev: ca.applied },
                  { label: "内定", count: ca.offered, prev: ca.in_selection },
                  { label: "入社", count: ca.placed, prev: ca.offered },
                ];
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">
                        {ca.ca}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        歩留まり率: {pct(ca.placed, ca.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {stages.map((s, i) => {
                        const rate = i === 0 ? "" : pct(s.count, s.prev);
                        return (
                          <div key={i} className="flex items-center gap-1">
                            {i > 0 && (
                              <div className="flex flex-col items-center px-1">
                                <span className={`text-xs font-medium ${rateColor(rate)}`}>
                                  {rate}
                                </span>
                                <span className="text-gray-300">→</span>
                              </div>
                            )}
                            <div className={`text-center px-3 py-2 rounded-lg min-w-[60px] ${
                              i === 0
                                ? "bg-blue-50 border border-blue-200"
                                : i === stages.length - 1
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}>
                              <div className="text-[10px] text-gray-500">
                                {s.label}
                              </div>
                              <div className="text-lg font-bold text-gray-800">
                                {s.count}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
