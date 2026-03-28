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

interface SubStatuses {
  conducted: { noshow: number; declined: number };
  supporting: { noshow: number; declined: number; released: number };
  offered: { noshow: number; declined: number };
  accepted: { noshow: number; declined: number };
}

interface CaStats {
  ca: string;
  applied: number;
  setup: number;
  conducted: number;
  conducted_noshow: number;
  conducted_declined: number;
  supporting: number;
  support_noshow: number;
  support_declined: number;
  support_released: number;
  offered: number;
  offer_noshow: number;
  offer_declined: number;
  offer_accepted: number;
  accepted_noshow: number;
  accepted_declined: number;
  placed: number;
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

function sumCaStats(cas: CaStats[]): CaStats {
  return cas.reduce(
    (acc, ca) => ({
      ca: "合計",
      applied: acc.applied + ca.applied,
      setup: acc.setup + ca.setup,
      conducted: acc.conducted + ca.conducted,
      conducted_noshow: acc.conducted_noshow + ca.conducted_noshow,
      conducted_declined: acc.conducted_declined + ca.conducted_declined,
      supporting: acc.supporting + ca.supporting,
      support_noshow: acc.support_noshow + ca.support_noshow,
      support_declined: acc.support_declined + ca.support_declined,
      support_released: acc.support_released + ca.support_released,
      offered: acc.offered + ca.offered,
      offer_noshow: acc.offer_noshow + ca.offer_noshow,
      offer_declined: acc.offer_declined + ca.offer_declined,
      offer_accepted: acc.offer_accepted + ca.offer_accepted,
      accepted_noshow: acc.accepted_noshow + ca.accepted_noshow,
      accepted_declined: acc.accepted_declined + ca.accepted_declined,
      placed: acc.placed + ca.placed,
    }),
    {
      ca: "合計", applied: 0, setup: 0, conducted: 0,
      conducted_noshow: 0, conducted_declined: 0,
      supporting: 0, support_noshow: 0, support_declined: 0, support_released: 0,
      offered: 0, offer_noshow: 0, offer_declined: 0,
      offer_accepted: 0, accepted_noshow: 0, accepted_declined: 0, placed: 0,
    }
  );
}

export default function AnalyticsClient() {
  const [period, setPeriod] = useState<Period>("this_month");
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [subStatuses, setSubStatuses] = useState<SubStatuses | null>(null);
  const [overallRate, setOverallRate] = useState(0);
  const [total, setTotal] = useState(0);
  const [caPerformance, setCaPerformance] = useState<CaStats[]>([]);
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
        setSubStatuses(funnelJson.data.subStatuses || null);
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

  const totals = caPerformance.length > 0 ? sumCaStats(caPerformance) : null;

  return (
    <div className="space-y-6">
      {/* ヘッダー + 期間フィルター */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">歩留まり分析</h1>
          <p className="text-sm text-gray-500 mt-1">
            求職者のステージ別転換率・離脱分析
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
              <p className="text-sm text-gray-500">応募数</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {total}
                <span className="text-base font-normal text-gray-400 ml-1">名</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">サポート中</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {funnel.find((s) => s.stage === "サポート")?.count ?? 0}
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
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{s.stage}</span>
                  <span>{s.count}名</span>
                  {i > 0 && <span className="text-gray-300">({s.rate}%)</span>}
                </div>
              ))}
            </div>
          </div>

          {/* サブステータス離脱詳細 */}
          {subStatuses && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                ステージ別 離脱詳細
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-700 mb-2">実施後</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">トビ</span><span className="font-medium text-red-600">{subStatuses.conducted.noshow}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">辞退</span><span className="font-medium text-orange-600">{subStatuses.conducted.declined}</span></div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-yellow-700 mb-2">サポート後</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">トビ</span><span className="font-medium text-red-600">{subStatuses.supporting.noshow}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">辞退</span><span className="font-medium text-orange-600">{subStatuses.supporting.declined}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">リリース</span><span className="font-medium text-gray-600">{subStatuses.supporting.released}</span></div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-700 mb-2">内定後</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">トビ</span><span className="font-medium text-red-600">{subStatuses.offered.noshow}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">辞退</span><span className="font-medium text-orange-600">{subStatuses.offered.declined}</span></div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-emerald-700 mb-2">承諾後</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">トビ</span><span className="font-medium text-red-600">{subStatuses.accepted.noshow}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">辞退</span><span className="font-medium text-orange-600">{subStatuses.accepted.declined}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== CA別 歩留まり詳細テーブル（スプレッドシート形式） ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              CA別 歩留まり詳細
            </h2>
            {caPerformance.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">データがありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-2 font-semibold text-gray-600 whitespace-nowrap bg-gray-50 sticky left-0 z-10" rowSpan={2}>担当CA</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200" colSpan={1}>応募</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200" colSpan={2}>設置</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200" colSpan={4}>実施</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200" colSpan={5}>サポート</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200" colSpan={4}>内定</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200" colSpan={4}>承諾</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200" colSpan={1}>入社</th>
                    </tr>
                    <tr className="border-b border-gray-200 text-xs">
                      {/* 応募 */}
                      <th className="text-center py-1 px-1 text-gray-500">件数</th>
                      {/* 設置 */}
                      <th className="text-center py-1 px-1 text-gray-500">件数</th>
                      <th className="text-center py-1 px-1 text-blue-600 bg-blue-50">率</th>
                      {/* 実施 */}
                      <th className="text-center py-1 px-1 text-gray-500">件数</th>
                      <th className="text-center py-1 px-1 text-blue-600 bg-blue-50">率</th>
                      <th className="text-center py-1 px-1 text-red-500">トビ</th>
                      <th className="text-center py-1 px-1 text-orange-500">辞退</th>
                      {/* サポート */}
                      <th className="text-center py-1 px-1 text-gray-500">件数</th>
                      <th className="text-center py-1 px-1 text-blue-600 bg-blue-50">率</th>
                      <th className="text-center py-1 px-1 text-red-500">トビ</th>
                      <th className="text-center py-1 px-1 text-orange-500">辞退</th>
                      <th className="text-center py-1 px-1 text-gray-500">リリース</th>
                      {/* 内定 */}
                      <th className="text-center py-1 px-1 text-gray-500">件数</th>
                      <th className="text-center py-1 px-1 text-blue-600 bg-blue-50">率</th>
                      <th className="text-center py-1 px-1 text-red-500">トビ</th>
                      <th className="text-center py-1 px-1 text-orange-500">辞退</th>
                      {/* 承諾 */}
                      <th className="text-center py-1 px-1 text-gray-500">件数</th>
                      <th className="text-center py-1 px-1 text-blue-600 bg-blue-50">率</th>
                      <th className="text-center py-1 px-1 text-red-500">トビ</th>
                      <th className="text-center py-1 px-1 text-orange-500">辞退</th>
                      {/* 入社 */}
                      <th className="text-center py-1 px-1 text-emerald-600 bg-green-50">件数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caPerformance.map((ca, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-2 font-medium text-gray-800 whitespace-nowrap bg-white sticky left-0 z-10">{ca.ca}</td>
                        <td className="text-center py-2 px-1 font-semibold">{ca.applied}</td>
                        <td className="text-center py-2 px-1">{ca.setup}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 font-medium ${rateColor(pct(ca.setup, ca.applied))}`}>{pct(ca.setup, ca.applied)}</td>
                        <td className="text-center py-2 px-1">{ca.conducted}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 font-medium ${rateColor(pct(ca.conducted, ca.setup))}`}>{pct(ca.conducted, ca.setup)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{ca.conducted_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{ca.conducted_declined || ""}</td>
                        <td className="text-center py-2 px-1">{ca.supporting}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 font-medium ${rateColor(pct(ca.supporting, ca.conducted))}`}>{pct(ca.supporting, ca.conducted)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{ca.support_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{ca.support_declined || ""}</td>
                        <td className="text-center py-2 px-1 text-gray-500">{ca.support_released || ""}</td>
                        <td className="text-center py-2 px-1">{ca.offered}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 font-medium ${rateColor(pct(ca.offered, ca.supporting))}`}>{pct(ca.offered, ca.supporting)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{ca.offer_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{ca.offer_declined || ""}</td>
                        <td className="text-center py-2 px-1">{ca.offer_accepted}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 font-medium ${rateColor(pct(ca.offer_accepted, ca.offered))}`}>{pct(ca.offer_accepted, ca.offered)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{ca.accepted_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{ca.accepted_declined || ""}</td>
                        <td className="text-center py-2 px-1 font-bold bg-green-50 text-emerald-700">{ca.placed}</td>
                      </tr>
                    ))}
                    {/* 合計行 */}
                    {totals && (
                      <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                        <td className="py-2 px-2 text-gray-800 whitespace-nowrap bg-gray-50 sticky left-0 z-10">合計</td>
                        <td className="text-center py-2 px-1">{totals.applied}</td>
                        <td className="text-center py-2 px-1">{totals.setup}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 ${rateColor(pct(totals.setup, totals.applied))}`}>{pct(totals.setup, totals.applied)}</td>
                        <td className="text-center py-2 px-1">{totals.conducted}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 ${rateColor(pct(totals.conducted, totals.setup))}`}>{pct(totals.conducted, totals.setup)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{totals.conducted_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{totals.conducted_declined || ""}</td>
                        <td className="text-center py-2 px-1">{totals.supporting}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 ${rateColor(pct(totals.supporting, totals.conducted))}`}>{pct(totals.supporting, totals.conducted)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{totals.support_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{totals.support_declined || ""}</td>
                        <td className="text-center py-2 px-1 text-gray-500">{totals.support_released || ""}</td>
                        <td className="text-center py-2 px-1">{totals.offered}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 ${rateColor(pct(totals.offered, totals.supporting))}`}>{pct(totals.offered, totals.supporting)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{totals.offer_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{totals.offer_declined || ""}</td>
                        <td className="text-center py-2 px-1">{totals.offer_accepted}</td>
                        <td className={`text-center py-2 px-1 bg-blue-50 ${rateColor(pct(totals.offer_accepted, totals.offered))}`}>{pct(totals.offer_accepted, totals.offered)}</td>
                        <td className="text-center py-2 px-1 text-red-600">{totals.accepted_noshow || ""}</td>
                        <td className="text-center py-2 px-1 text-orange-600">{totals.accepted_declined || ""}</td>
                        <td className="text-center py-2 px-1 bg-green-50 text-emerald-700">{totals.placed}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
