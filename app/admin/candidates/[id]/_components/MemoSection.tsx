"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CandidateMemo, MemoType } from "@/types/candidate";
import { MEMO_TYPE_LABELS, MEMO_TYPE_COLORS } from "@/types/candidate";

interface Props {
  candidateId: string;
  initialMemos: CandidateMemo[];
}

const MEMO_TYPES: MemoType[] = ["interview", "contact", "other"];

export default function MemoSection({ candidateId, initialMemos }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [memos, setMemos] = useState<CandidateMemo[]>(initialMemos);
  const [content, setContent] = useState("");
  const [memoType, setMemoType] = useState<MemoType>("other");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    const res = await fetch(`/api/candidates/${candidateId}/memos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, memo_type: memoType }),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(json.error ?? "エラーが発生しました");
      return;
    }

    // 楽観的更新: 先頭に追加
    setMemos((prev) => [json.data as CandidateMemo, ...prev]);
    setContent("");
    setMemoType("other");
    startTransition(() => router.refresh());
  }

  async function handleDelete(memoId: string) {
    setDeletingId(memoId);

    const res = await fetch(`/api/candidates/${candidateId}/memos/${memoId}`, {
      method: "DELETE",
    });

    setDeletingId(null);

    if (res.ok) {
      setMemos((prev) => prev.filter((m) => m.id !== memoId));
      startTransition(() => router.refresh());
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
      <h2 className="text-base font-semibold mb-4" style={{ color: "#002D37" }}>
        メモ・連絡履歴
      </h2>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="mb-6">
        {/* 種別タブ */}
        <div className="flex gap-2 mb-3">
          {MEMO_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMemoType(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                memoType === type
                  ? MEMO_TYPE_COLORS[type] + " border-transparent"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {MEMO_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="メモを入力してください..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
        />

        {submitError && (
          <p className="mt-1 text-xs text-red-600">{submitError}</p>
        )}

        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#00c752] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#00E05D", color: "#002D37" }}
          >
            {submitting ? "保存中..." : "追加する"}
          </button>
        </div>
      </form>

      {/* メモ一覧 */}
      {memos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          メモはまだありません
        </p>
      ) : (
        <ul className="space-y-3">
          {memos.map((memo) => (
            <li
              key={memo.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* 種別タグ + メタ情報 */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MEMO_TYPE_COLORS[memo.memo_type]}`}
                    >
                      {MEMO_TYPE_LABELS[memo.memo_type]}
                    </span>
                    <span className="text-xs" style={{ color: "#6B7280" }}>
                      {new Date(memo.created_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {memo.author?.full_name && (
                      <span className="text-xs" style={{ color: "#6B7280" }}>
                        by {memo.author.full_name}
                      </span>
                    )}
                  </div>
                  {/* 本文 */}
                  <p
                    className="text-sm whitespace-pre-wrap break-words"
                    style={{ color: "#002D37" }}
                  >
                    {memo.content}
                  </p>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => handleDelete(memo.id)}
                  disabled={deletingId === memo.id}
                  className="flex-shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  aria-label="削除"
                >
                  {deletingId === memo.id ? "削除中..." : "削除"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
