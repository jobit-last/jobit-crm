"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalMainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F6FF" }}>
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/portal/dashboard"
            className="text-lg font-bold"
            style={{ color: "#0649C4" }}
          >
            Jobit マイページ
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
