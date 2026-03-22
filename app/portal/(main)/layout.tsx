"use client";

import { useState, useEffect } from "react";
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
  const [candidateName, setCandidateName] = useState("");

  useEffect(() => {
    async function fetchCandidateName() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("candidates")
        .select("last_name, first_name")
        .eq("email", user.email)
        .single();

      if (data) {
        setCandidateName(`${data.last_name} ${data.first_name}`);
      }
    }
    fetchCandidateName();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F6FF" }}>
      {/* サブヘッダー（PITキャリア マイページ + ログアウト） */}
      <header
        className="sticky top-0 z-30"
        style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <Link
              href="/portal/dashboard"
              className="text-sm sm:text-lg text-white truncate"
              style={{ letterSpacing: "0.15em", fontWeight: 900 }}
            >
              {candidateName ? `${candidateName}様 マイページ` : "マイページ"}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm transition-colors cursor-pointer"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              ログアウト
            </button>
          </div>

          {/* タブナビゲーション */}
          <nav className="-mb-px flex gap-1 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-white text-white"
                      : "border-transparent hover:border-white/40"
                  }`}
                  style={
                    isActive
                      ? { color: "#FFFFFF", borderBottomColor: "#FFFFFF" }
                      : { color: "rgba(255,255,255,0.7)" }
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
