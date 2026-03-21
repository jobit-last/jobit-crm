import Link from "next/link";

export const metadata = {
  title: "求人一覧 | PITキャリア",
  description: "あなたにぴったりの求人を見つけよう",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F6FF" }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "linear-gradient(135deg, #16B1F3, #0649C4)",
          boxShadow: "0 4px 24px rgba(6, 73, 196, 0.35), 0 1px 4px rgba(22, 177, 243, 0.2)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/portal/jobs" className="flex items-center gap-2">
            <span className="font-bold text-xl text-white tracking-tight">PITキャリア</span>
            <span className="text-sm hidden sm:block" style={{ color: "rgba(255,255,255,0.8)" }}>ポータル</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/portal/jobs"
              className="font-medium text-white relative py-1 transition-all hover:after:scale-x-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:scale-x-0 after:origin-center after:transition-transform after:duration-200"
            >
              求人一覧
            </Link>
            <Link
              href="/portal/jobs/search"
              className="font-medium text-white relative py-1 transition-all hover:after:scale-x-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:scale-x-0 after:origin-center after:transition-transform after:duration-200"
            >
              検索
            </Link>
            <Link
              href="/portal/jobs/compare"
              className="font-medium text-white relative py-1 transition-all hover:after:scale-x-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:scale-x-0 after:origin-center after:transition-transform after:duration-200"
            >
              比較
            </Link>
            <Link
              href="/portal/jobs/favorites"
              className="font-medium text-white relative py-1 transition-all hover:after:scale-x-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:scale-x-0 after:origin-center after:transition-transform after:duration-200"
            >
              ♥ お気に入り
            </Link>
            <Link
              href="/portal/learning"
              className="font-medium relative py-1 transition-all hover:after:scale-x-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:scale-x-0 after:origin-center after:transition-transform after:duration-200"
              style={{ color: "#00B59A" }}
            >
              📚 学習
            </Link>
          </nav>
        </div>
      </header>

      {/* コンテンツ */}
      <main>{children}</main>

      {/* フッター */}
      <footer className="mt-16 bg-white">
        {/* Gradient accent line */}
        <div
          className="h-1"
          style={{ background: "linear-gradient(90deg, #16B1F3, #0649C4, #2394FF, #00B59A)" }}
        />
        <div className="py-8">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-400">
            © 2026 PITキャリア. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
