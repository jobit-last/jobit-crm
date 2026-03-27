"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

export default function JobsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [jobType, setJobType] = useState(searchParams.get("job_type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [salaryMin, setSalaryMin] = useState(searchParams.get("salary_min") || "");
  const [salaryMax, setSalaryMax] = useState(searchParams.get("salary_max") || "");
  const [isPublished, setIsPublished] = useState(searchParams.get("is_published") || "");

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (jobType) params.set("job_type", jobType);
    if (location) params.set("location", location);
    if (salaryMin) params.set("salary_min", salaryMin);
    if (salaryMax) params.set("salary_max", salaryMax);
    if (isPublished !== "") params.set("is_published", isPublished);
    params.set("page", "1");
    router.push(`/admin/jobs?${params.toString()}`);
  }, [keyword, jobType, location, salaryMin, salaryMax, isPublished, router]);

  const handleReset = useCallback(() => {
    setKeyword("");
    setJobType("");
    setLocation("");
    setSalaryMin("");
    setSalaryMax("");
    setIsPublished("");
    router.push("/admin/jobs");
  }, [router]);

  const inputClass = "w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-sm font-medium text-primary mb-1";

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>キーワード</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="職種・スキル・説明文で検索"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>職種</label>
          <input
            type="text"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="エンジニア・営業など"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>勤務地</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="東京・大阪など"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>年収下限（万円）</label>
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="300"
            min={0}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>年収上限（万円）</label>
          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="1000"
            min={0}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>公開状態</label>
          <select
            value={isPublished}
            onChange={(e) => setIsPublished(e.target.value)}
            className={inputClass}
          >
            <option value="">すべて</option>
            <option value="true">公開中</option>
            <option value="false">非公開</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSearch}
          className="bg-cta hover:bg-cta-hover text-primary font-semibold px-6 py-2 rounded text-sm transition-colors"
        >
          検索
        </button>
        <button
          onClick={handleReset}
          className="bg-secondary hover:bg-gray-300 text-primary px-6 py-2 rounded text-sm font-medium transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
