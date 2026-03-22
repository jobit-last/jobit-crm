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
    <div style={{ backgroundColor: "#F2F6FF", minHeight: "100%" }} className="pb-8">
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/portal/interview-prep" className="hover:underline" style={{ color: "#2394FF" }}>
          面接対策
        </Link>
        <span>/</span>
        <span className="truncate" style={{ color: "#21242B" }}>{article.title}</span>
      </div>

      {/* Gradient B ヘッダーバナー */}
      <div
        className="rounded-2xl px-4 sm:px-8 py-6 sm:py-8 mb-8 shadow-lg"
        style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {article.category && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm"
            >
              {article.category}
            </span>
          )}
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-xl font-bold text-white">
          {article.title}
        </h1>
        <p className="text-xs text-white/60 mt-2">
          更新日: {new Date(article.updated_at).toLocaleDateString("ja-JP")}
        </p>
      </div>

      {/* 本文カード */}
      <article className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        {/* 本文 */}
        {article.content ? (
          <div className="prose prose-sm max-w-none prose-headings:text-[#21242B] prose-a:text-[#2394FF]">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-400">コンテンツがありません</p>
        )}
      </article>

      {/* Tips セクション */}
      <div
        className="rounded-2xl p-5 mt-6 border-l-4"
        style={{ backgroundColor: "#E8F0F6", borderLeftColor: "#00B59A" }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "#00B59A" }}>
          面接のポイント
        </p>
        <p className="text-xs text-gray-600">
          記事の内容を参考に、自分なりの回答を準備しておきましょう。具体的なエピソードを交えて話すと効果的です。
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/portal/interview-prep"
          className="inline-flex items-center text-sm font-medium text-white px-5 py-2 rounded-xl shadow-md transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
        >
          ← 面接対策一覧に戻る
        </Link>
      </div>
    </div>
  );
}
