import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Knowledge, KnowledgeCategory } from "@/types/knowledge";
import { CATEGORY_COLORS } from "@/types/knowledge";
import type { Interview } from "@/types/interview";
import { INTERVIEW_TYPE_LABELS, INTERVIEW_TYPE_COLORS } from "@/types/interview";

// カードの左ボーダー色をインデックスに応じて回す
const CARD_ACCENT_COLORS = ["#2394FF", "#00B59A", "#F67A34", "#0649C4", "#EE542F", "#16B1F3"];
function getCardAccent(index: number): string {
  return CARD_ACCENT_COLORS[index % CARD_ACCENT_COLORS.length];
}

export default async function InterviewPrepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .eq("is_deleted", false)
    .single();

  // 面接対策ナレッジ記事
  const { data: articles } = await supabase
    .from("knowledge")
    .select("*")
    .eq("category", "面接対策")
    .order("updated_at", { ascending: false })
    .limit(20);

  // その他カテゴリの記事（企業情報・業界情報）
  const { data: otherArticles } = await supabase
    .from("knowledge")
    .select("*")
    .in("category", ["企業情報", "業界情報"])
    .order("updated_at", { ascending: false })
    .limit(10);

  // 今後の面接（あれば）
  let upcomingInterviews: (Interview & { application?: any })[] = [];
  if (candidate) {
    const { data: ivData } = await supabase
      .from("interviews")
      .select("*, application:applications!inner(candidate_id, job:jobs(id, title, company:companies(id, name)))")
      .eq("application.candidate_id", candidate.id)
      .gt("scheduled_at", new Date().toISOString())
      .is("result", null)
      .order("scheduled_at", { ascending: true })
      .limit(3);
    upcomingInterviews = (ivData ?? []) as any[];
  }

  const prepArticles = (articles as Knowledge[]) ?? [];
  const refArticles = (otherArticles as Knowledge[]) ?? [];

  return (
    <div style={{ backgroundColor: "#F2F6FF", minHeight: "100%" }} className="pb-8">
      {/* Hero Header */}
      <div
        className="rounded-2xl px-8 py-8 mb-8 shadow-lg"
        style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
      >
        <h1 className="text-2xl font-bold text-white">面接対策</h1>
        <p className="text-white/70 text-sm mt-1">面接に向けた準備と対策ナレッジ</p>
      </div>

      {/* 今後の面接 */}
      {upcomingInterviews.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#16B1F3" }}>
            今後の面接予定
          </h2>
          <div className="space-y-3">
            {upcomingInterviews.map((iv) => (
              <div
                key={iv.id}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between gap-4 border-l-4"
                style={{ borderLeftColor: "#EE542F" }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${INTERVIEW_TYPE_COLORS[iv.interview_type]}`}
                    >
                      {INTERVIEW_TYPE_LABELS[iv.interview_type]}
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #EE542F, #F67A34, #FFA639)" }}
                    >
                      予定あり
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate" style={{ color: "#21242B" }}>
                    {iv.application?.job?.company?.name} / {iv.application?.job?.title}
                  </p>
                  {iv.location && (
                    <p className="text-xs text-gray-500 mt-0.5">場所: {iv.location}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold" style={{ color: "#2394FF" }}>
                    {new Date(iv.scheduled_at).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </p>
                  <p className="text-xs" style={{ color: "#2394FF" }}>
                    {new Date(iv.scheduled_at).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 面接対策ナレッジ */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#16B1F3" }}>
          面接対策ノート
        </h2>

        {prepArticles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-gray-400">面接対策の記事はまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {prepArticles.map((article, idx) => (
              <Link
                key={article.id}
                href={`/portal/interview-prep/${article.id}`}
                className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all block border-l-4"
                style={{ borderLeftColor: getCardAccent(idx) }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {article.category && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[article.category]}`}
                    >
                      {article.category}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold line-clamp-2" style={{ color: "#21242B" }}>
                  {article.title}
                </h3>
                {article.content && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {article.content.slice(0, 100)}
                  </p>
                )}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "#E8F0F6", color: "#2394FF" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] mt-2" style={{ color: "#2394FF" }}>
                  {new Date(article.updated_at).toLocaleDateString("ja-JP")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 企業・業界情報 */}
      {refArticles.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#16B1F3" }}>
            企業・業界情報
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {refArticles.map((article, idx) => (
              <Link
                key={article.id}
                href={`/portal/interview-prep/${article.id}`}
                className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all block border-l-4"
                style={{ borderLeftColor: "#00B59A" }}
              >
                {article.category && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mb-2 ${CATEGORY_COLORS[article.category]}`}
                  >
                    {article.category}
                  </span>
                )}
                <h3 className="text-sm font-semibold line-clamp-2" style={{ color: "#21242B" }}>
                  {article.title}
                </h3>
                {article.content && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {article.content.slice(0, 100)}
                  </p>
                )}
                <p className="text-[10px] mt-2" style={{ color: "#2394FF" }}>
                  {new Date(article.updated_at).toLocaleDateString("ja-JP")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
