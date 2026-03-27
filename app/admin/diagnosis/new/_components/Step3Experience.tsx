"use client";

import type { DiagnosisFormData } from "@/types/diagnosis";

interface Props {
  data: DiagnosisFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onManagementChange: (value: boolean) => void;
}

export default function Step3Experience({
  data,
  onChange,
  onManagementChange,
}: Props) {
  return (
    <div className="space-y-6">
      {/* 主な職務内容 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            1
          </span>
          主な職務内容
        </h3>
        <p className="text-xs mb-2" style={{ color: "#6B7280" }}>
          現職・直近の職務内容を具体的に記入してください
        </p>
        <textarea
          name="work_history"
          value={data.work_history}
          onChange={onChange}
          rows={5}
          placeholder="例: ○○業界向けのSaaS製品の新規顧客開拓営業を担当。リード獲得からクロージングまで一気通貫で対応。月次で20件以上の商談を実施し、年間30〜40件の新規成約を達成。"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
        />
      </div>

      {/* 実績・成果 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            2
          </span>
          実績・成果
        </h3>
        <p className="text-xs mb-2" style={{ color: "#6B7280" }}>
          数字で表せる実績があれば具体的に記入してください
        </p>
        <textarea
          name="achievements"
          value={data.achievements}
          onChange={onChange}
          rows={5}
          placeholder="例:&#10;・前年比150%の売上達成（2023年度）&#10;・新規顧客獲得数：年間45件（部門トップ）&#10;・既存顧客の解約率を12%→5%に改善&#10;・プロジェクトのコスト削減：年間約300万円の削減を実現"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
        />
      </div>

      {/* マネジメント経験 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            3
          </span>
          マネジメント経験
        </h3>

        <div className="flex gap-3 mb-4">
          {[
            { value: true, label: "あり" },
            { value: false, label: "なし" },
          ].map((opt) => (
            <label
              key={String(opt.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                data.has_management === opt.value
                  ? "border-[#002D37]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={
                data.has_management === opt.value
                  ? { backgroundColor: "#F0F9FA" }
                  : {}
              }
            >
              <input
                type="radio"
                name="has_management"
                checked={data.has_management === opt.value}
                onChange={() => onManagementChange(opt.value)}
                className="accent-[#002D37]"
              />
              <span className="text-sm font-medium" style={{ color: "#1A1A2E" }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {data.has_management === true && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              マネジメント経験の詳細
            </label>
            <textarea
              name="management_detail"
              value={data.management_detail}
              onChange={onChange}
              rows={3}
              placeholder="例: 営業チーム5名のプレイングマネージャーとして3年間担当。採用・育成・目標設定・進捗管理を実施。"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
