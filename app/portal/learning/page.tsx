import Link from "next/link";

const ACCENT = "#2394FF";
const MINT   = "#00B59A";
const GRAD_B = "linear-gradient(135deg, #16B1F3, #0649C4)";
const GRAD_O = "linear-gradient(135deg, #EE542F, #F67A34, #FFA639)";

export default function LearningTopPage() {
  return (
    <div style={{ backgroundColor: "#F2F6FF" }} className="min-h-screen">
      {/* Hero section — gradient B */}
      <div
        className="rounded-b-3xl px-4 pt-14 pb-16 text-center"
        style={{ background: GRAD_B }}
      >
        <span
          className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
        >
          学習コンテンツ
        </span>
        <h1 className="text-3xl font-bold mb-3 text-white">
          転職準備を始めよう
        </h1>
        <p className="text-sm text-white/80 max-w-md mx-auto">
          IT業界の基礎知識から職種の違いまで、転職に役立つコンテンツを無料でご提供しています。
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10">
        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <Link
            href="/portal/learning/it"
            className="bg-white rounded-2xl shadow-md p-8 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            style={{ borderLeft: `4px solid ${ACCENT}` }}
          >
            <div className="text-4xl mb-4">💻</div>
            <h2 className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity" style={{ color: "#21242B" }}>
              IT業界の基礎知識
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              業界構造・主要技術スタック・IT用語を解説。IT未経験の方も安心。
            </p>
            <span
              className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-1.5 rounded-xl text-white shadow-md transition-opacity group-hover:opacity-90"
              style={{ background: GRAD_B }}
            >
              学ぶ →
            </span>
          </Link>

          <Link
            href="/portal/learning/jobs"
            className="bg-white rounded-2xl shadow-md p-8 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            style={{ borderLeft: `4px solid ${MINT}` }}
          >
            <div className="text-4xl mb-4">👨‍💻</div>
            <h2 className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity" style={{ color: "#21242B" }}>
              IT職種ガイド
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              フロントエンド・バックエンド・PM・データなど8職種を年収・スキルで徹底比較。
            </p>
            <span
              className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-1.5 rounded-xl text-white shadow-md transition-opacity group-hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${MINT}, ${ACCENT})` }}
            >
              学ぶ →
            </span>
          </Link>
        </div>

        {/* Important callout — gradient O accent */}
        <div
          className="rounded-2xl p-8 text-center text-white mb-8"
          style={{ background: GRAD_O }}
        >
          <p className="text-lg font-bold mb-2">まずは気軽に始めてみましょう</p>
          <p className="text-sm text-white/80">
            すべてのコンテンツは無料。5分で読める内容からスタートできます。
          </p>
        </div>
      </div>
    </div>
  );
}
