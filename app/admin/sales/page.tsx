"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Spinner from "@/components/Spinner";

const inputClass =
  "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm font-medium text-primary mb-1";

interface SalesRecord {
  id: string;
  ca_id: string | null;
  candidate_id: string | null;
  company_id: string | null;
  amount: number;
  month: string;
  status: string;
  notes: string | null;
  ca?: { id: string; name: string } | null;
  candidate?: { id: string; name: string } | null;
  company?: { id: string; name: string } | null;
}

interface MonthlyTotal {
  month: string;
  total: number;
  count: number;
}

interface CaTotal {
  id: string;
  name: string;
  total: number;
  count: number;
}

interface CaOption {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "未確定",
  confirmed: "確定",
  paid: "入金済",
  cancelled: "キャンセル",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

export default function SalesPage() {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [caTotals, setCaTotals] = useState<CaTotal[]>([]);
  const [cas, setCas] = useState<CaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCaId, setFilterCaId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [newSale, setNewSale] = useState({
    ca_id: "",
    candidate_id: "",
    company_id: "",
    amount: "",
    month: "",
    status: "pending",
    notes: "",
  });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCaId) params.set("ca_id", filterCaId);
      const res = await fetch(`/api/sales?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSales(json.data || []);
        setMonthlyTotals(json.meta?.monthly_totals || []);
        setCaTotals(json.meta?.ca_totals || []);
        setCas(json.meta?.cas || []);
      }
    } catch {
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [filterCaId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.amount || !newSale.month) {
      setError("金額と月は必須です");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSale),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddForm(false);
        setNewSale({ ca_id: "", candidate_id: "", company_id: "", amount: "", month: "", status: "pending", notes: "" });
        fetchSales();
      } else {
        setError(json.message || "登録に失敗しました");
      }
    } catch {
      setError("通信エラー");
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);

  // 今月の合計
  const now = new Date();
  const thisMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthTotal = monthlyTotals.find((m) => m.month === thisMonth);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">売上管理</h1>
        <div className="flex gap-3 items-center">
          <select
            value={filterCaId}
            onChange={(e) => setFilterCaId(e.target.value)}
            className="border border-secondary rounded px-3 py-2 text-sm"
          >
            <option value="">全CA</option>
            {cas.map((ca) => (
              <option key={ca.id} value={ca.id}>{ca.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-cta hover:bg-cta-hover text-primary font-semibold px-5 py-2 rounded text-sm transition-colors"
          >
            + 売上登録
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">今月の売上</p>
          <p className="text-2xl font-bold text-primary">
            {thisMonthTotal ? formatAmount(thisMonthTotal.total) : "---"}
          </p>
          <p className="text-xs text-gray-400 mt-1">{thisMonthTotal?.count || 0}件</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">年間累計</p>
          <p className="text-2xl font-bold text-primary">
            {formatAmount(monthlyTotals.reduce((s, m) => s + m.total, 0))}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {monthlyTotals.reduce((s, m) => s + m.count, 0)}件
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">月平均</p>
          <p className="text-2xl font-bold text-primary">
            {formatAmount(
              monthlyTotals.length > 0
                ? Math.round(monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.filter((m) => m.total > 0).length || 1)
                : 0
            )}
          </p>
        </div>
      </div>

      {/* 新規登録フォーム */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-primary mb-4">売上新規登録</h2>
          <form onSubmit={handleSubmitNew} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>金額（円） <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={newSale.amount}
                  onChange={(e) => setNewSale((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="500000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>対象月 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newSale.month}
                  onChange={(e) => setNewSale((p) => ({ ...p, month: e.target.value }))}
                  placeholder="2026/04"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ステータス</label>
                <select
                  value={newSale.status}
                  onChange={(e) => setNewSale((p) => ({ ...p, status: e.target.value }))}
                  className={inputClass}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>担当CA</label>
                <select
                  value={newSale.ca_id}
                  onChange={(e) => setNewSale((p) => ({ ...p, ca_id: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">未設定</option>
                  {cas.map((ca) => (
                    <option key={ca.id} value={ca.id}>{ca.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>備考</label>
                <input
                  type="text"
                  value={newSale.notes}
                  onChange={(e) => setNewSale((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="メモ"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-cta hover:bg-cta-hover text-primary font-semibold px-6 py-2 rounded text-sm disabled:opacity-50"
              >
                {submitting ? <Spinner size={16} className="inline mr-1" /> : null}登録
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-secondary hover:bg-gray-300 text-primary px-6 py-2 rounded text-sm"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : (
        <>
          {/* グラフ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 月別売上推移 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-primary mb-4">月別売上推移</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTotals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v: number) => `${Math.round(v / 10000)}万`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: unknown) => [formatAmount(value as number), "売上"]}
                  />
                  <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CA別売上 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-primary mb-4">CA別売上</h3>
              {caTotals.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={caTotals}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={((entry: { name: string; percent: number }) =>
                        `${entry.name} ${(entry.percent * 100).toFixed(0)}%`
                      ) as unknown as boolean}
                    >
                      {caTotals.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown) => [formatAmount(value as number), "売上"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-16">データがありません</div>
              )}
            </div>
          </div>

          {/* 売上一覧テーブル */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-primary">売上一覧</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left px-4 py-3 font-medium">月</th>
                    <th className="text-left px-4 py-3 font-medium">担当CA</th>
                    <th className="text-left px-4 py-3 font-medium">企業</th>
                    <th className="text-left px-4 py-3 font-medium">求職者</th>
                    <th className="text-right px-4 py-3 font-medium">金額</th>
                    <th className="text-center px-4 py-3 font-medium">ステータス</th>
                    <th className="text-left px-4 py-3 font-medium">備考</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        売上データがありません
                      </td>
                    </tr>
                  ) : (
                    sales.map((s) => (
                      <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{s.month}</td>
                        <td className="px-4 py-3">{s.ca?.name || "---"}</td>
                        <td className="px-4 py-3">{s.company?.name || "---"}</td>
                        <td className="px-4 py-3">{s.candidate?.name || "---"}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatAmount(s.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || ""}`}>
                            {STATUS_LABELS[s.status] || s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 truncate maw-w-[200px]">
                          {s.notes || ""}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
