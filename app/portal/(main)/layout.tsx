"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "マイページ", href: "/portal/dashboard" },
  { label: "選考状況", href: "/portal/applications" },
  { label: "スケジュール", href: "/portal/schedule" },
  { label: "面接対策", href: "/portal/interview-prep" },
  { label: "プロフィール", href: "/portal/profile" },
];

export default function PortalMainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F6FF" }}>
      {/* ヘッダー */}
      <header className="sticky top-0 z-30" style={{ backgroundColor: "#21242B", borderBottom: "1px solid #21242B" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <Link
              href="/portal/dashboard"
              className="text-lg font-bold text-white"
            >
              PITキャリア マイページ
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              ログアウト
            </button>
          </div>

          {/* ナビゲーション */}
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-[#2394FF] text-[#2394FF]"
                      : "border-transparent hover:border-gray-500"
                  }`}
                  style={isActive ? {} : { color: "rgba(255,255,255,0.7)" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
