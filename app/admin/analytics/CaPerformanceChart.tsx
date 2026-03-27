"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

interface Props {
  data: CaPerformance[];
}

export default function CaPerformanceChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 件数グラフ */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">CA別ステージ別件数</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ca"
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="total"        name="登録"  fill="#9CA3AF" />
            <Bar dataKey="interviewed"  name="面談"  fill="#3B82F6" />
            <Bar dataKey="applied"      name="応募"  fill="#8B5CF6" />
            <Bar dataKey="in_selection" name="面接"  fill="#F59E0B" />
            <Bar dataKey="offered"      name="内定"  fill="#10B981" />
            <Bar dataKey="placed"       name="入社"  fill="#002D37" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="px-4 py-2 border border-gray-200 font-medium">CA名</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">登録</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">面談</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">応募</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">面接</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">内定</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">入社</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">面談→選考率</th>
              <th className="px-4 py-2 border border-gray-200 font-medium text-right">総合歩留まり</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-200 font-medium">{row.ca}</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.total}</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.interviewed}</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.applied}</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.in_selection}</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.offered}</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.placed}</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.interview_to_selection_rate}%</td>
                <td className="px-4 py-2 border border-gray-200 text-right">{row.overall_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
