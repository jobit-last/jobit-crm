"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
}

interface Props {
  data: FunnelStage[];
}

const COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#002D37"];

export default function FunnelChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 80, left: 48, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="stage"
          tick={{ fontSize: 13 }}
          width={44}
        />
        <Tooltip
          formatter={(value: number, _name: string, props) => {
            const rate = props.payload?.rate;
            return [`${value}名 (${rate}%)`, "人数"];
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            formatter={(v: number) => `${v}名`}
            style={{ fontSize: 12, fill: "#374151" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
