"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Resume } from "@/types/resume";

interface Props {
  candidateId: string;
  resumes: Resume[];
}

export default function ResumesClient({ candidateId, resumes }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(resumeId: string) {
    if (!confirm("この履歴書を削除しますか？")) return;
    setDeletingId(resumeId);

    const res = await fetch(
      `/api/candidates/${candidateId}/resumes/${resumeId}`,
      { method: "DELETE" }
    );

    setDeletingId(null);
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  function handleDownloadPdf(resumeId: string) {
    window.open(
      `/api/candidates/${candidateId}/resumes/${resumeId}/pdf`,
      "_blank"
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <span className="text-sm text-gray-500">
            全 <span className="font-semibold text-gray-700">{resumes.length}</span> 件
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            履歴書がまだ作成されていません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-sm font-medium truncate"
                        style={{ color: "#002D37" }}
                      >
                        {resume.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        v{resume.version}
                      </span>
                      {resume.is_ai_generated && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          AI生成
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      作成日:{" "}
                      {new Date(resume.created_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {resume.updated_at !== resume.created_at && (
                        <>
                          {" "}/ 更新日:{" "}
                          {new Date(resume.updated_at).toLocaleString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/candidates/${candidateId}/resumes/${resume.id}`
                        )
                      }
                      className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(resume.id)}
                      className="text-xs px-3 py-1.5 rounded-md font-medium text-[#002D37] transition-colors hover:bg-[#00c752]"
                      style={{ backgroundColor: "#00E05D" }}
                    >
                      PDF出力
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {deletingId === resume.id ? "削除中..." : "削除"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
