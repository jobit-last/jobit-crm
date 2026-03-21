"use client";

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData { month: string; count: number; }
interface StatusData  { status: string; count: number; }
interface CaData      { ca: string; count: number; }

interface DashboardChartsProps {
  monthlyRegistrations: MonthlyData[];
  statusCounts: StatusData[];
  caCounts: CaData[];
}

const PRIMARY   = "#002D37";
const ACCENT    = "#00A8CC";
const SECONDARY = "#F59E0B";

export default function DashboardCharts({
  monthlyRegistrations,
  statusCounts,
  caCounts,
}: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* 月別求職者登録数（折れ線グラフ） */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          月別求職者登録数（過去12ヶ月）
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyRegistrations} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
              contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13 }}
              formatter={(value: unknown) => [`${value}人`, "登録数"]}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 選考ステータス別件数（棒グラフ） */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            選考ステータス別件数
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={statusCounts}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 70, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="status"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                width={68}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13 }}
                formatter={(value: unknown) => [`${value}人`, "件数"]}
              />
              <Bar dataKey="count" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CA別担当求職者数（棒グラフ） */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            CA別担当求職者数（上位10名）
          </h2>
          {caCounts.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
              データがありません
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={caCounts}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 70, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="ca"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={68}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13 }}
                  formatter={(value: unknown) => [`${value}人`, "担当数"]}
                />
                <Bar dataKey="count" fill={SECONDARY} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
