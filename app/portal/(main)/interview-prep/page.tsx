import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Knowledge, KnowledgeCategory } from "@/types/knowledge";
import { CATEGORY_COLORS } from "@/types/knowledge";
import type { Interview } from "@/types/interview";
import { INTERVIEW_TYPE_LABELS, INTERVIEW_TYPE_COLORS } from "@/types/interview";

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
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#21242B" }}>
        面接対策
      </h1>

      {/* 今後の面接 */}
      {upcomingInterviews.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            今後の面接予定
          </h2>
          <div className="space-y-3">
            {upcomingInterviews.map((iv) => (
              <div
                key={iv.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${INTERVIEW_TYPE_COLORS[iv.interview_type]}`}
                    >
                      {INTERVIEW_TYPE_LABELS[iv.interview_type]}
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
                  <p className="text-sm font-medium" style={{ color: "#2394FF" }}>
                    {new Date(iv.scheduled_at).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
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
        <h2 className="text-base font-semibold mb-4" style={{ color: "#21242B" }}>
          面接対策ノート
        </h2>

        {prepArticles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">面接対策の記事はまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {prepArticles.map((article) => (
              <Link
                key={article.id}
                href={`/portal/interview-prep/${article.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-[#2394FF]/40 transition-colors block"
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
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2">
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
          <h2 className="text-base font-semibold mb-4" style={{ color: "#21242B" }}>
            企業・業界情報
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {refArticles.map((article) => (
              <Link
                key={article.id}
                href={`/portal/interview-prep/${article.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-[#00B59A]/40 transition-colors block"
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
                <p className="text-[10px] text-gray-400 mt-2">
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
