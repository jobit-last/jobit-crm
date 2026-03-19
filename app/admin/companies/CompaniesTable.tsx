"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TEMPERATURE_LABELS, TEMPERATURE_COLORS, type Company, type Temperature } from "@/types/company";

interface CompaniesTableProps {
  companies: Company[];
}

export default function CompaniesTable({ companies }: CompaniesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sort_by") || "created_at";
  const currentSortOrder = searchParams.get("sort_order") || "desc";

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSortBy === column) {
      params.set("sort_order", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sort_by", column);
      params.set("sort_order", "asc");
    }
    router.push(`/admin/companies?${params.toString()}`);
  };

  const getSortIcon = (column: string) => {
    if (currentSortBy !== column) return "↕";
    return currentSortOrder === "asc" ? "↑" : "↓";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        該当する企業が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-primary text-white text-left">
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("name")}
            >
              企業名 {getSortIcon("name")}
            </th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("industry")}
            >
              業種 {getSortIcon("industry")}
            </th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("company_size")}
            >
              規模 {getSortIcon("company_size")}
            </th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("temperature")}
            >
              採用温度 {getSortIcon("temperature")}
            </th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("created_at")}
            >
              登録日 {getSortIcon("created_at")}
            </th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company, index) => (
            <tr
              key={company.id}
              onClick={() => router.push(`/admin/companies/${company.id}`)}
              className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-3 text-sm font-medium text-primary">
                {company.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {company.industry || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {company.company_size || "-"}
              </td>
              <td className="px-4 py-3 text-sm">
                {company.temperature ? (
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      TEMPERATURE_COLORS[company.temperature as Temperature]
                    }`}
                  >
                    {company.temperature}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(company.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
