"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Job } from "@/types/job";

interface JobsTableProps {
  jobs: Job[];
  onPublishToggle: (id: string, current: boolean) => Promise<void>;
}

const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return "-";
  if (min && max) return `${min}〜${max}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
};

export default function JobsTable({ jobs, onPublishToggle }: JobsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    router.push(`/admin/jobs?${params.toString()}`);
  };

  const getSortIcon = (column: string) => {
    if (currentSortBy !== column) return "↕";
    return currentSortOrder === "asc" ? "↑" : "↓";
  };

  const handleToggle = async (e: React.MouseEvent, id: string, current: boolean) => {
    e.stopPropagation();
    setTogglingId(id);
    await onPublishToggle(id, current);
    setTogglingId(null);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        該当する求人が見つかりませんでした。
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
              onClick={() => handleSort("title")}
            >
              求人タイトル {getSortIcon("title")}
            </th>
            <th className="px-4 py-3 text-sm font-medium">企業名</th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("job_type")}
            >
              職種 {getSortIcon("job_type")}
            </th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("location")}
            >
              勤務地 {getSortIcon("location")}
            </th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("salary_min")}
            >
              年収 {getSortIcon("salary_min")}
            </th>
            <th
              className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={() => handleSort("is_published")}
            >
              公開状態 {getSortIcon("is_published")}
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
          {jobs.map((job, index) => (
            <tr
              key={job.id}
              onClick={() => router.push(`/admin/jobs/${job.id}`)}
              className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-3 text-sm font-medium text-primary">
                {job.title}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {job.company_name || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {job.job_type || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {job.location || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatSalary(job.salary_min, job.salary_max)}
              </td>
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={(e) => handleToggle(e, job.id, job.is_published)}
                  disabled={togglingId === job.id}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                    job.is_published
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${job.is_published ? "bg-green-500" : "bg-gray-400"}`} />
                  {job.is_published ? "公開中" : "非公開"}
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(job.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
