"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { TEMPERATURE_LABELS, type Temperature } from "@/types/company";

const TEMPERATURES = Object.keys(TEMPERATURE_LABELS) as Temperature[];

export default function CompaniesSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");
  const [temperature, setTemperature] = useState(searchParams.get("temperature") || "");

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (industry) params.set("industry", industry);
    if (temperature) params.set("temperature", temperature);
    params.set("page", "1");
    router.push(`/admin/companies?${params.toString()}`);
  }, [name, industry, temperature, router]);

  const handleReset = useCallback(() => {
    setName("");
    setIndustry("");
    setTemperature("");
    router.push("/admin/companies");
  }, [router]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            企業名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="企業名で検索"
            className="w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            業種
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="業種で検索"
            className="w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            採用温度
          </label>
          <select
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full border border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">すべて</option>
            {TEMPERATURES.map((t) => (
              <option key={t} value={t}>
                {TEMPERATURE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSearch}
          className="bg-cta hover:bg-cta-hover text-white px-6 py-2 rounded text-sm font-medium transition-colors"
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
