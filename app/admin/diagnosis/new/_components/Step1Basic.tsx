"use client";

import type { DiagnosisFormData } from "@/types/diagnosis";
import { EDUCATION_OPTIONS, INDUSTRY_OPTIONS } from "@/types/diagnosis";

interface Props {
  data: DiagnosisFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

export default function Step1Basic({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* 個人情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            1
          </span>
          個人情報
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={onChange}
              required
              placeholder="山田 太郎"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              年齢
            </label>
            <div className="relative">
              <input
                type="number"
                name="age"
                value={data.age}
                onChange={onChange}
                min={18}
                max={70}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">歳</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              最終学歴
            </label>
            <select
              name="education"
              value={data.education}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            >
              <option value="">選択してください</option>
              {EDUCATION_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 現職情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#00A0B0" }}>
            2
          </span>
          現職情報
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              現在の会社名
            </label>
            <input
              type="text"
              name="company"
              value={data.company}
              onChange={onChange}
              placeholder="株式会社〇〇"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              業種
            </label>
            <select
              name="industry"
              value={data.industry}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            >
              <option value="">選択してください</option>
              {INDUSTRY_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              職種
            </label>
            <input
              type="text"
              name="occupation"
              value={data.occupation}
              onChange={onChange}
              placeholder="営業、エンジニア、マーケター など"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              現在の年収
            </label>
            <div className="relative">
              <input
                type="number"
                name="current_salary"
                value={data.current_salary}
                onChange={onChange}
                min={0}
                placeholder="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">万円</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              勤続年数
            </label>
            <div className="relative">
              <input
                type="number"
                name="tenure_years"
                value={data.tenure_years}
                onChange={onChange}
                min={0}
                max={50}
                placeholder="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0B0] focus:border-transparent pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">年</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
