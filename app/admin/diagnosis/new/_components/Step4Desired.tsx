"use client";

import type { DiagnosisFormData } from "@/types/diagnosis";
import { DESIRED_TIMING_OPTIONS } from "@/types/diagnosis";

interface Props {
  data: DiagnosisFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

export default function Step4Desired({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* 希望条件 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            1
          </span>
          希望条件
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              希望職種
            </label>
            <input
              type="text"
              name="desired_occupation"
              value={data.desired_occupation}
              onChange={onChange}
              placeholder="例: 営業マネージャー、プロダクトマネージャー など"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              希望年収
            </label>
            <div className="relative">
              <input
                type="number"
                name="desired_salary"
                value={data.desired_salary}
                onChange={onChange}
                min={0}
                placeholder="700"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                万円
              </span>
            </div>
            {data.current_salary && data.desired_salary && (
              <p className="mt-1 text-xs" style={{ color: "#00A0B0" }}>
                現在比:{" "}
                {Number(data.desired_salary) >= Number(data.current_salary)
                  ? `+${Number(data.desired_salary) - Number(data.current_salary)}万円`
                  : `${Number(data.desired_salary) - Number(data.current_salary)}万円`}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              転職希望時期
            </label>
            <select
              name="desired_timing"
              value={data.desired_timing}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            >
              <option value="">選択してください</option>
              {DESIRED_TIMING_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              希望勤務地
            </label>
            <input
              type="text"
              name="desired_location"
              value={data.desired_location}
              onChange={onChange}
              placeholder="例: 東京都内、首都圏、リモート可であれば全国 など"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* CAメモ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#002D37" }}>
            2
          </span>
          CAメモ
        </h3>
        <p className="text-xs mb-4 ml-8" style={{ color: "#6B7280" }}>
          ※ 求職者には非公開の内部メモです
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              面談での気づき
            </label>
            <textarea
              name="ca_notes"
              value={data.ca_notes}
              onChange={onChange}
              rows={4}
              placeholder="例: 転職動機は明確で、現職のマネジメントへの不満が主因。ただし人間関係の問題もありそうで、丁寧に深掘りが必要。技術力は高いが自己評価が低い傾向あり。"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              印象
            </label>
            <textarea
              name="ca_impression"
              value={data.ca_impression}
              onChange={onChange}
              rows={3}
              placeholder="例: 落ち着いた印象で論理的な話し方。面接本番でも好印象を与えられると思われる。積極的に質問も多く、意欲は高い。"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
