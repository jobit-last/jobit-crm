"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";

// Data interfaces
interface KpiData {
  new_candidates: number;
  interviewed: number;
  in_selection: number;
  offered: number;
  placed: number;
}

interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
  pessimistic_count: number;
  optimistic_count: number;
}

interface LeadTime {
  avg_days: number;
  min_days: number;
  max_days: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

interface CaOption {
  id: string;
  name: string;
}

interface EnhancedDashboardResponse {
  success: boolean;
  data: {
    kpi: KpiData;
    funnel: FunnelStage[];
    lead_time: LeadTime;
    monthly: MonthlyData[];
  };
  error?: string;
}

// Constants
const PRIMARY = "#002D37";
const ACCENT = "#00A8CC";
const SECONDARY = "#F59E0B";
const RED = "#EF4444";
const GREEN = "#10B981";

const PERIODS = [
  { value: "this_month", label: "今月" },
  { value: "last_month", label: "先月" },
  { value: "3_months", label: "3ヶ月" },
  { value: "6_months", label: "半年" },
] as const;

type Period = typeof PERIODS[number]["value"];

const KPI_CONFIG = [
  { key: "new_candidates", label: "新規求職者", icon: "👤", color: "#3B82F6" },
  { key: "interviewed", label: "面談数", icon: "💬", color: "#8B5CF6" },
  { key: "in_selection", label: "面接数", icon: "📋", color: "#F59E0B" },
  { key: "offered", label: "内定数", icon: "🎉", color: "#10B981" },
  { key: "placed", label: "入社数", icon: "🏢", color: "#002D37" },
] as const;

// KPI Card Component
interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: color + "20" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold" style={{ color }}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Custom tooltip for funnel chart
function FunnelChartTooltip(props: any) {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
        <p className="font-semibold text-gray-700 mb-2">{data.stage}</p>
        <p className="text-gray-600">
          実績: <span className="font-medium">{data.count}</span>名
        </p>
        <p className="text-gray-600">
          悲観値: <span className="font-medium text-red-500">{data.pessimistic_count}</span>名
        </p>
        <p className="text-gray-600">
          楽観値: <span className="font-medium text-green-500">{data.optimistic_count}</span>名
        </p>
      </div>
    );
  }
  return null;
}

// Main component
export default function EnhancedDashboard() {
  const [caOptions, setCaOptions] = useState<CaOption[]>([]);
  const [selectedCa, setSelectedCa] = useState<string>("all");
  const [period, setPeriod] = useState<Period>("this_month");
  const [kpi, setKpi] = useState<KpiData>({
    new_candidates: 0,
    interviewed: 0,
    in_selection: 0,
    offered: 0,
    placed: 0,
  });
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [leadTime, setLeadTime] = useState<LeadTime>({
    avg_days: 0,
    min_days: 0,
    max_days: 0,
  });
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CA options from enhanced API
  useEffect(() => {
    const fetchCaOptions = async () => {
      try {
        const res = await fetch("/api/dashboard/enhanced?period=this_month");
        if (!res.ok) throw new Error("Failed to fetch CA list");
        const json = await res.json();
        if (json.success && json.data?.cas) {
          setCaOptions(json.data.cas);
        }
      } catch (err) {
        console.error("Error fetching CA options:", err);
      }
    };
    fetchCaOptions();
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (caId: string, p: Period) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (caId !== "all") params.append("ca_id", caId);
      params.append("period", p);

      const res = await fetch(`/api/dashboard/enhanced?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const json: EnhancedDashboardResponse = await res.json();
      if (json.success && json.data) {
        setKpi(json.data.kpi);
        setFunnel(json.data.funnel || []);
        setLeadTime(json.data.lead_time || { avg_days: 0, min_days: 0, max_days: 0 });
        setMonthlyTrend(json.data.monthly || []);
      } else {
        throw new Error(json.error || "Failed to load dashboard data");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "エラーが発生しました";
      setError(message);
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for updating data when CA or period changes
  useEffect(() => {
    fetchDashboardData(selectedCa, period);
  }, [selectedCa, period, fetchDashboardData]);

  // Get current month label
  const now = new Date();
  const currentMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">詳細分析</p>
      </div>

      {/* Selectors Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* CA Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">CA:</label>
          <select
            value={selectedCa}
            onChange={(e) => setSelectedCa(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
          >
            <option value="all">全メンバー</option>
            {caOptions.map((ca) => (
              <option key={ca.id} value={ca.id}>
                {ca.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
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

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          読み込み中...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {KPI_CONFIG.map(({ key, label, icon, color }) => (
              <KpiCard
                key={key}
                label={label}
                value={kpi[key as keyof KpiData]}
                icon={icon}
                color={color}
              />
            ))}
          </div>

          {/* Funnel Chart with Pessimistic/Optimistic */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              変換ファネル（実績 vs 悲観値 vs 楽観値）
            </h2>
            {funnel.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-sm text-gray-400">
                データがありません
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={funnel}
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#BFCED1" horizontal={true} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip content={<FunnelChartTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="square"
                      formatter={(value) => {
                        const labels: Record<string, string> = {
                          count: "実績",
                          pessimistic_count: "悲観値",
                          optimistic_count: "楽観値",
                        };
                        return labels[value] || value;
                      }}
                    />
                    <Bar dataKey="count" fill={PRIMARY} barSize={20} />
                    <Bar
                      dataKey="pessimistic_count"
                      fill={RED}
                      barSize={20}
                      opacity={0.6}
                    />
                    <Bar
                      dataKey="optimistic_count"
                      fill={GREEN}
                      barSize={20}
                      opacity={0.6}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Funnel Details */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">ステージ別詳細</p>
                    {funnel.map((stage, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-600">{stage.stage}</span>
                        <div className="flex gap-4">
                          <span className="text-gray-700">
                            実: <strong>{stage.count}</strong>名
                          </span>
                          <span className="text-red-600">
                            悲: <strong>{stage.pessimistic_count}</strong>名
                          </span>
                          <span className="text-green-600">
                            楽: <strong>{stage.optimistic_count}</strong>名
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conversion rates */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">段階別転換率</p>
                    {funnel.map((stage, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-600">{stage.stage}</span>
                        <span className="font-medium text-primary">
                          {idx === 0 ? "-" : `${stage.rate}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Lead Time Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-6">
              リード時間
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">平均リードタイム</p>
                <p className="text-4xl font-bold text-blue-600">
                  {leadTime.avg_days}
                </p>
                <p className="text-sm text-gray-500 mt-2">日</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">最短</p>
                <p className="text-4xl font-bold text-green-600">
                  {leadTime.min_days}
                </p>
                <p className="text-sm text-gray-500 mt-2">日</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600 mb-2">最長</p>
                <p className="text-4xl font-bold text-orange-600">
                  {leadTime.max_days}
                </p>
                <p className="text-sm text-gray-500 mt-2">日</p>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              月別トレンド
            </h2>
            {monthlyTrend.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-sm text-gray-400">
                データがありません
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#BFCED1" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #BFCED1",
                      fontSize: 13,
                    }}
                    formatter={(value: unknown) => [`${value}名`, "件数"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={ACCENT}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: ACCENT, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
