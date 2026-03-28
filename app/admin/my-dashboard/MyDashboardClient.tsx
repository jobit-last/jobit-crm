"use client";

import { useState } from "react";
import Link from "next/link";

interface CandidateItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  current_company: string | null;
  current_salary: number | null;
  desired_salary: number | null;
  updated_at: string;
  created_at: string;
}

interface Stage {
  key: string;
  label: string;
  color: string;
}

interface MyKpi {
  total: number;
  thisMonth: number;
  active: number;
  placed: number;
  offered: number;
}

interface CaDataItem {
  candidates: CandidateItem[];
  myKpi: MyKpi;
  alertCount: number;
}

interface Props {
  currentCaId: string;
  caList: { id: string; name: string }[];
  allCaData: Record<string, CaDataItem>;
  stages: Stage[];
}

// サブステータス（離脱済み）
const TERMINAL_STATUSES = [
  "placed",
  "conducted_noshow", "conducted_declined",
  "support_noshow", "support_declined", "support_released",
  "offer_noshow", "offer_declined",
  "accepted_noshow", "accepted_declined",
];

function daysAgo(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function MyDashboardClient({
  currentCaId,
  caList,
  allCaData,
  stages,
}: Props) {
  const [selectedCaId, setSelectedCaId] = useState(currentCaId);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const currentData = allCaData[selectedCaId] || {
    candidates: [],
    myKpi: { total: 0, thisMonth: 0, active: 0, placed: 0, offered: 0 },
    alertCount: 0,
  };
  const { candidates, myKpi, alertCount } = currentData;
  const selectedCa = caList.find((ca) => ca.id === selectedCaId);
  const caName = selectedCa?.name || "";

  async function handleDrop(candidateId: string, newStatus: string) {
    setUpdating(candidateId);
    try {
      await fetch("/api/candidates/" + candidateId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      window.location.reload();
    } catch {
      alert("ステータス更新に失敗しました");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-primary">マイダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">{caName}の担当状況</p>
      </div>

      {/* CA選択プルダウン */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="ca-select"
          className="text-sm font-medium text-gray-600"
        >
          担当CA:
        </label>
        <select
          id="ca-select"
          value={selectedCaId}
          onChange={(e) => setSelectedCaId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {caList.map((ca) => {
            const caData = allCaData[ca.id];
            const count = caData?.myKpi?.total || 0;
            const isSelf = ca.id === currentCaId;
            return (
              <option key={ca.id} value={ca.id}>
                {ca.name}（{count}名）{isSelf ? " ★自分" : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">担当求職者数</p>
          <p className="text-2xl font-bold text-blue-600">{myKpi.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">今月の新規</p>
          <p className="text-2xl font-bold text-purple-600">
            {myKpi.thisMonth}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">アクティブ</p>
          <p className="text-2xl font-bold text-amber-600">{myKpi.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">内定</p>
          <p className="text-2xl font-bold text-emerald-600">
            {myKpi.offered}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            要フォロー
            {alertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            )}
          </p>
          <p
            className={
              "text-2xl font-bold " +
              (alertCount > 0 ? "text-red-600" : "text-gray-400")
            }
          >
            {alertCount}
          </p>
        </div>
      </div>

      {/* カンバンボード */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          パイプライン（ドラッグ&ドロップでステータス変更）
        </h2>
        <div
          className="flex gap-3 overflow-x-auto pb-4"
          style={{ minHeight: 400 }}
        >
          {stages.map((stage) => {
            const items = candidates.filter((c) => c.status === stage.key);
            const isOver = dragOverStage === stage.key;
            return (
              <div
                key={stage.key}
                className={
                  "flex-shrink-0 rounded-xl p-3 transition-colors " +
                  (isOver ? "ring-2 ring-blue-400" : "")
                }
                style={{
                  width: 220,
                  backgroundColor: isOver ? "#EBF5FF" : "#F9FAFB",
                  minHeight: 350,
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(stage.key);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStage(null);
                  const cId = e.dataTransfer.getData("text/plain");
                  if (cId) handleDrop(cId, stage.key);
                }}
              >
                {/* ステージヘッダー */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white text-gray-500 shadow-sm">
                    {items.length}
                  </span>
                </div>

                {/* カード */}
                <div className="space-y-2">
                  {items.map((c) => {
                    const days = daysAgo(c.updated_at);
                    const isAlert =
                      days >= 3 &&
                      !TERMINAL_STATUSES.includes(c.status);
                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", c.id)
                        }
                        className={
                          "bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-3 " +
                          (updating === c.id ? "opacity-50" : "")
                        }
                        style={{
                          borderLeftWidth: 3,
                          borderLeftColor: stage.color,
                        }}
                      >
                        <Link
                          href={"/admin/candidates/" + c.id}
                          className="block"
                        >
                          <p className="text-sm font-medium text-gray-800 truncate hover:text-blue-600">
                            {c.name}
                          </p>
                          {c.current_company && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {c.current_company}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {days === 0 ? "今日" : days + "日前"}
                            </span>
                            {isAlert && (
                              <span className="text-xs text-red-500 font-medium">
                                要対応
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
