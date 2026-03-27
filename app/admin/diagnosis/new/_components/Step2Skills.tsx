"use client";

import type { DiagnosisFormData } from "@/types/diagnosis";

interface Props {
  data: DiagnosisFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onCertificationChange: (index: number, value: string) => void;
  onAddCertification: () => void;
  onRemoveCertification: (index: number) => void;
}

export default function Step2Skills({
  data,
  onChange,
  onCertificationChange,
  onAddCertification,
  onRemoveCertification,
}: Props) {
  return (
    <div className="space-y-6">
      {/* 保有資格 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            1
          </span>
          保有資格
        </h3>
        <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
          資格・免許を入力してください（複数入力可）
        </p>
        <div className="space-y-2">
          {data.certifications.map((cert, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={cert}
                onChange={(e) => onCertificationChange(i, e.target.value)}
                placeholder={`例: 基本情報技術者、TOEIC 800点、宅地建物取引士`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
              />
              {data.certifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveCertification(i)}
                  className="px-2 py-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddCertification}
          className="mt-3 flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: "#00A0B0" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          資格を追加
        </button>
      </div>

      {/* 得意な業務・スキル */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            2
          </span>
          得意な業務・スキル
        </h3>
        <textarea
          name="strengths"
          value={data.strengths}
          onChange={onChange}
          rows={4}
          placeholder="例: 新規顧客開拓、提案営業、プロジェクトマネジメント、データ分析（Excel・SQL）など"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
        />
      </div>

      {/* 使用できるツール・システム */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            3
          </span>
          使用できるツール・システム
        </h3>
        <textarea
          name="tools"
          value={data.tools}
          onChange={onChange}
          rows={4}
          placeholder="例: Microsoft Office（Excel・PowerPoint・Word）、Salesforce、Slack、Jira、GitHub、AWS など"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
        />
      </div>
    </div>
  );
}
