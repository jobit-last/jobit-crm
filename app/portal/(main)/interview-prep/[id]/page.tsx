import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Knowledge } from "@/types/knowledge";
import { CATEGORY_COLORS } from "@/types/knowledge";
import ReactMarkdown from "react-markdown";

export default async function InterviewPrepArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data, error } = await supabase
    .from("knowledge")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const article = data as Knowledge;

  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/portal/interview-prep" className="hover:underline" style={{ color: "#2394FF" }}>
          面接対策
        </Link>
        <span>/</span>
        <span className="truncate" style={{ color: "#1E293B" }}>{article.title}</span>
      </div>

      <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* バッジ */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {article.category && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[article.category]}`}
            >
              {article.category}
            </span>
          )}
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* タイトル */}
        <h1 className="text-xl font-bold mb-4" style={{ color: "#1E293B" }}>
          {article.title}
        </h1>

        <p className="text-xs text-gray-400 mb-6">
          更新日: {new Date(article.updated_at).toLocaleDateString("ja-JP")}
        </p>

        {/* 本文 */}
        {article.content ? (
          <div className="prose prose-sm max-w-none prose-headings:text-[#1E293B] prose-a:text-[#2394FF]">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-400">コンテンツがありません</p>
        )}
      </article>

      <div className="mt-6">
        <Link
          href="/portal/interview-prep"
          className="text-sm font-medium hover:underline"
          style={{ color: "#2394FF" }}
        >
          ← 面接対策一覧に戻る
        </Link>
      </div>
    </div>
  );
}
