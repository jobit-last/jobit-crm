"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DIMENSIONS = [
  { key: "gender", label: "性別" },
  { key: "age", label: "年齢" },
  { key: "salary", label: "年収" },
  { key: "status", label: "ステータス" },
];

const COLORS = [
  "#002D37",
  "#00A8CC",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
];

interface DemographicData {
  label: string;
  count: number;
  percentage: number;
}

interface CA {
  id: string;
  name: string;
}

export default function DemographicsClient() {
  const [dimension, setDimension] = useState<string>("gender");
  const [caId, setCaId] = useState<string>("");
  const [data, setData] = useState<DemographicData[]>([]);
  const [cas, setCas] = useState<CA[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Fetch CA list
  useEffect(() => {
    const fetchCas = async () => {
      try {
        const res = await fetch("/api/dashboard/enhanced?period=this_month");
        const json = await res.json();
        if (json.success && json.data?.cas) {
          setCas(json.data.cas);
        }
      } catch (err) {
        console.error("Failed to fetch CAs:", err);
      }
    };
    fetchCas();
  }, []);

  // Fetch demographic data
  const fetchData = useCallback(async (dim: string, selectedCaId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ dimension: dim });
      if (selectedCaId) {
        params.append("ca_id", selectedCaId);
      }
      const res = await fetch(`/api/analytics/demographics?${params}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch demographics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(dimension, caId);
  }, [dimension, caId, fetchData]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-primary">数値分析</h1>
        <p className="text-sm text-gray-500 mt-1">求職者データの人口統計分析</p>
      </div>

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 block mb-2">CA</label>
          <select
            value={caId}
            onChange={(e) => setCaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">全メンバー</option>
            {cas.map((ca) => (
              <option key={ca.id} value={ca.id}>
                {ca.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ディメンション選択タブ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">分析項目</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIMENSIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDimension(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dimension === key
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm bg-white rounded-xl shadow-sm border border-gray-100">
          読み込み中...
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm bg-white rounded-xl shadow-sm border border-gray-100">
          データがありません
        </div>
      ) : (
        <>
          {/* サマリーカード */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">対象求職者数</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {total}
              <span className="text-base font-normal text-gray-400 ml-1">名</span>
            </p>
          </div>

          {/* チャートエリア */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 横棒グラフ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">内訳（件数）</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 100, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={95}
                  />
                  <Tooltip formatter={(value: unknown) => [`${value}`, "件数"]} />
                  <Bar dataKey="count" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 円グラフ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">内訳（構成比）</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="label"
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => {
                      if (typeof value === "number") return [value, "件数"];
                      return [`${value}`, "件数"];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* テーブル */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">詳細データ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="px-4 py-3 border border-gray-200 font-medium">
                      カテゴリ
                    </th>
                    <th className="px-4 py-3 border border-gray-200 font-medium text-right">
                      件数
                    </th>
                    <th className="px-4 py-3 border border-gray-200 font-medium text-right">
                      構成比
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="px-4 py-3 border border-gray-200 font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          {row.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-right">
                        {row.count}
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-right">
                        {row.percentage}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 border border-gray-200">計</td>
                    <td className="px-4 py-3 border border-gray-200 text-right">
                      {data.reduce((sum, row) => sum + row.count, 0)}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-right">
                      {data.reduce((sum, row) => sum + row.percentage, 0).toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
