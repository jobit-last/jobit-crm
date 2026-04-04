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
  { key: "gender", label: "æ§å¥" },
  { key: "age", label: "å¹´é½¢" },
  { key: "salary", label: "å¹´å" },
  { key: "status", label: "ã¹ãã¼ã¿ã¹" },
  { key: "experience", label: "çµé¨" },
  { key: "education", label: "å­¦æ­´" },
  { key: "residence", label: "å±ä½å°" },
  { key: "active", label: "ã¢ã¯ãã£ã" },
  { key: "other_agent", label: "ä»ç¤¾ã¨ã¼ã¸ã§ã³ã" },
  { key: "medical_history", label: "æ¢å¾æ­´" },
  { key: "arts_science", label: "æç" },
  { key: "occupation", label: "è·ç¨®" },
  { key: "color", label: "è²" },
  { key: "employment_type", label: "éç¨å½¢æ" },
  { key: "relocation", label: "è»¢å±æç¡" },
  { key: "conversation", label: "ä¼è©±éæ¯ç" },
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
      {/* ãããã¼ */}
      <div>
        <h1 className="text-2xl font-bold text-primary">æ°å¤åæ</h1>
        <p className="text-sm text-gray-500 mt-1">æ±è·èãã¼ã¿ã®äººå£çµ±è¨åæ</p>
      </div>

      {/+ ãã£ã«ã¿ã¼ */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 block mb-2">CA</label>
          <select
            value={caId}
            onChange={(e) => setCaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">å¨ã¡ã³ãã¼</option>
            {cas.map((ca) => (
              <option key={ca.id} value={ca.id}>
                {ca.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ãã£ã¡ã³ã·ã§ã³é¸æã¿ã */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">åæé ç®</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
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
          èª­ã¿è¾¼ã¿ä¸­...
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm bg-white rounded-xl shadow-sm border border-gray-100">
          ãã¼ã¿ãããã¾ãã
        </div>
      ) : (
        <>
          {/* ãµããªã¼ã«ã¼ã */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">å¯¾è±¡æ±è·èæ°</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {total}
              <span className="text-base font-normal text-gray-400 ml-1">å</span>
            </p>
          </div>

          {/* ãã£ã¼ãã¨ãªã¢ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* æ¨ªæ£ã°ã©ã */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">åè¨³ï¼ä»¶æ°ï¼</h2>
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
                  <Tooltip formatter={(value: unknown) => [`${value}`, "ä»¶æ°"]} />
                  <Bar dataKey="count" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* åã°ã©ã */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">åè¨³ï¼æ§ææ¯ï¼</h2>
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
                      if (typeof value === "number") return [value, "ä»¶æ°"];
                      return [`${value}`, "ä»¶æ°"];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ãã¼ãã« */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">è©³ç´°ãã¼ã¿</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="px-4 py-3 border border-gray-200 font-medium">
                      ã«ãã´ãª
                    </th>
                    <th className="px-4 py-3 border border-gray-200 font-medium text-right">
                      ä»¶æ°
                    </th>
                    <th className="px-4 py-3 border border-gray-200 font-medium text-right">
                      æ§ææ¯
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
                    <td className="px-4 py-3 border border-gray-200">è¨</td>
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
