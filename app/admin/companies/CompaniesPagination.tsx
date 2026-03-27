"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CompaniesPaginationProps {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export default function CompaniesPagination({
  total,
  page,
  perPage,
  totalPages,
}: CompaniesPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/admin/companies?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-600">
        全 {total} 件中 {from} - {to} 件を表示
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 rounded text-sm border border-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
        >
          前へ
        </button>
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => handlePageChange(p)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              p === page
                ? "bg-primary text-white border-primary"
                : "border-secondary hover:bg-secondary"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 rounded text-sm border border-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
