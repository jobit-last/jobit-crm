"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "マイページ", href: "/portal/dashboard" },
  { label: "求人一覧", href: "/portal/jobs" },
  { label: "♥ お気に入り", href: "/portal/jobs/favorites" },
  { label: "📚 学習", href: "/portal/learning", accent: true },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F6FF" }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 bg-white"
        style={{ borderBottom: "1px solid #C5CBD8" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/portal/jobs" className="flex items-center gap-2">
            <span className="text-xl" style={{ color: "#21242B", letterSpacing: "0.2em", fontWeight: 900 }}>PITキャリア</span>
            <span className="text-sm hidden sm:block" style={{ color: "#C5CBD8" }}>ポータル</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-5 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-medium relative py-1 transition-all hover:after:scale-x-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:scale-x-0 after:origin-center after:transition-transform after:duration-200"
                style={{
                  color: item.accent ? "#00B59A" : "#21242B",
                  ...(item.accent ? {} : {}),
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Hamburger button - mobile */}
          <button
            className="sm:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" style={{ color: "#21242B" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="sm:hidden border-t border-gray-100 bg-white">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-sm font-medium border-b border-gray-50 active:bg-gray-50"
                style={{ color: item.accent ? "#00B59A" : "#21242B", minHeight: "44px" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* コンテンツ */}
      <main>{children}</main>

      {/* フッター */}
      <footer className="mt-16 bg-white">
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
