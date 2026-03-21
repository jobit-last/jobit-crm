import Link from "next/link";

export const metadata = {
  title: "求人一覧 | Jobit",
  description: "あなたにぴったりの求人を見つけよう",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F6FF" }}>
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/portal/jobs" className="flex items-center gap-2">
            <span className="font-bold text-xl" style={{ color: "#2394FF" }}>Jobit</span>
            <span className="text-sm text-gray-400 hidden sm:block">求人ポータル</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/portal/jobs"           className="font-medium transition-opacity hover:opacity-60" style={{ color: "#2394FF" }}>求人一覧</Link>
            <Link href="/portal/jobs/search"    className="font-medium transition-opacity hover:opacity-60" style={{ color: "#2394FF" }}>検索</Link>
            <Link href="/portal/jobs/compare"   className="font-medium transition-opacity hover:opacity-60" style={{ color: "#2394FF" }}>比較</Link>
            <Link href="/portal/jobs/favorites"  className="font-medium transition-opacity hover:opacity-60" style={{ color: "#2394FF" }}>♥ お気に入り</Link>
            <Link href="/portal/learning"        className="font-medium transition-opacity hover:opacity-60" style={{ color: "#00B59A" }}>📚 学習</Link>
          </nav>
        </div>
      </header>

      {/* コンテンツ */}
      <main>{children}</main>

      {/* フッター */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-400">
          © 2026 Jobit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
