import Link from "next/link";

const ACCENT = "#2394FF";
const MINT   = "#00B59A";

export default function LearningTopPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <span
          className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4"
          style={{ backgroundColor: "#E8F4FF", color: ACCENT }}
        >
          学習コンテンツ
        </span>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A2E" }}>
          転職準備を始めよう
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          IT業界の基礎知識から職種の違いまで、転職に役立つコンテンツを無料でご提供しています。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/portal/learning/it"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 group hover:shadow-md transition-shadow"
        >
          <div className="text-4xl mb-4">💻</div>
          <h2 className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity" style={{ color: "#1A1A2E" }}>
            IT業界の基礎知識
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            業界構造・主要技術スタック・IT用語を解説。IT未経験の方も安心。
          </p>
          <span className="text-sm font-semibold" style={{ color: ACCENT }}>学ぶ →</span>
        </Link>

        <Link
          href="/portal/learning/jobs"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 group hover:shadow-md transition-shadow"
        >
          <div className="text-4xl mb-4">👨‍💻</div>
          <h2 className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity" style={{ color: "#1A1A2E" }}>
            IT職種ガイド
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            フロントエンド・バックエンド・PM・データなど8職種を年収・スキルで徹底比較。
          </p>
          <span className="text-sm font-semibold" style={{ color: MINT }}>学ぶ →</span>
        </Link>
      </div>
    </div>
  );
}
