"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { Contract } from "@/types/contract";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/contracts/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setContract(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function formatDate(d: string | null | undefined) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ja-JP");
  }

  if (loading) return <div className="text-center py-12 text-[#6B7280]">読み込み中...</div>;
  if (error) return <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>;
  if (!contract) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/contracts" className="text-sm text-[#6B7280] hover:text-[#002D37]">
          &larr; 契約書一覧
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#002D37]">{contract.title}</h1>
            <p className="text-sm text-[#6B7280] mt-1">企業: {contract.company_name ?? "-"}</p>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="font-medium text-[#6B7280]">開始日</dt>
            <dd className="mt-1 text-[#002D37]">{formatDate(contract.start_date)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#6B7280]">終了日</dt>
            <dd className="mt-1 text-[#002D37]">{formatDate(contract.end_date)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#6B7280]">登録日</dt>
            <dd className="mt-1 text-[#002D37]">{formatDate(contract.created_at)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#6B7280]">更新日</dt>
            <dd className="mt-1 text-[#002D37]">{formatDate(contract.updated_at)}</dd>
          </div>
          {contract.file_url && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-[#6B7280]">ファイル</dt>
              <dd className="mt-1">
                <a href={contract.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all">{contract.file_url}</a>
              </dd>
            </div>
          )}
          {contract.content && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-[#6B7280]">内容</dt>
              <dd className="mt-1 text-[#002D37] whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{contract.content}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.push("/admin/contracts")}
          className="px-4 py-2 border border-gray-300 text-[#002D37] rounded-lg hover:bg-gray-50 transition cursor-pointer">一覧に戻る</button>
      </div>
    </div>
  );
}
