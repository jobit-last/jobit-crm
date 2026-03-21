"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "ダッシュボード", href: "/admin/dashboard" },
  { label: "求職者管理", href: "/admin/candidates" },
  { label: "企業管理", href: "/admin/companies" },
  { label: "求人管理", href: "/admin/jobs" },
  { label: "選考管理", href: "/admin/applications" },
  { label: "スケジュール管理", href: "/admin/schedule" },
  { label: "通知管理", href: "/admin/notifications" },
  { label: "契約書管理", href: "/admin/contracts" },
  { label: "覚書管理", href: "/admin/memorandums" },
  { label: "請求書管理", href: "/admin/invoices" },
  { label: "歩留まり分析", href: "/admin/analytics" },
  { label: "市場価値診断", href: "/admin/diagnosis/new" },
  { label: "ナレッジ管理", href: "/admin/knowledge" },
  { label: "操作ログ", href: "/admin/logs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#EBEEEF" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 flex-shrink-0 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#002D37" }}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="text-white font-bold text-lg tracking-wide">
            Jobit CRM
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "text-white bg-white/15 font-medium"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
          {/* Hamburger button - mobile only */}
          <button
            className="mr-3 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="メニューを開く"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm" style={{ color: "#6B7280" }}>
            管理画面
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
