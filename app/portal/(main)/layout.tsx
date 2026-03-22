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
      <header
        className="sticky top-0 z-30 bg-white"
        style={{ borderBottom: "1px solid #C5CBD8" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <Link
              href="/portal/dashboard"
              className="text-lg font-bold"
              style={{ color: "#21242B", letterSpacing: "0.15em" }}
            >
              PITキャリア マイページ
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm transition-colors cursor-pointer"
              style={{ color: "#C5CBD8" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#21242B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#C5CBD8")}
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
                      ? ""
                      : "border-transparent hover:border-[#2394FF]/40"
                  }`}
                  style={
                    isActive
                      ? { color: "#2394FF", borderBottomColor: "#2394FF" }
                      : { color: "#21242B" }
                  }
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
