"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/supabase/auth";
import AiChatWidget from "@/components/AiChatWidget";

type NavChild = { label: string; href: string; children?: NavChild[] };
type NavItem = { label: string; href: string; children?: NavChild[] };

const navItems: NavItem[] = [
  {
    label: "ダッシュボード",
    href: "/admin/dashboard",
    children: [
      { label: "マイダッシュボード", href: "/admin/dashboard" },
      { label: "歩留まり分析", href: "/admin/analytics" },
      { label: "数値分析", href: "/admin/analytics/demographics" },
    ],
  },
  {
    label: "ガントチャート",
    href: "/admin/gantt",
  },
  {
    label: "求職者管理",
    href: "/admin/candidates",
    children: [
      {
        label: "選考管理",
        href: "/admin/applications",
        children: [
          { label: "面接登録", href: "/admin/interviews/new" },
        ],
      },
    ],
  },
  {
    label: "企業管理",
    href: "/admin/companies",
    children: [
      { label: "求人管理", href: "/admin/jobs" },
      {
        label: "契紀・請求関係",
        href: "/admin/contracts",
        children: [
          { label: "契約書管理", href: "/admin/contracts" },
          { label: "覚書管理", href: "/admin/memorandums" },
          { label: "請求書管理", href: "/admin/invoices" },
        ],
      },
    ],
  },
  { label: "売上管理", href: "/admin/sales" },
  { label: "スケジュール管理", href: "/admin/schedule" },
  { label: "通知管理", href: "/admin/notifications" },
  { label: "市場価値診断", href: "/admin/diagnosis/new" },
  {
    label: "ナレッジ管理",
    href: "/admin/knowledge",
    children: [
      { label: "ナレッジ一覧", href: "/admin/knowledge" },
      { label: "AI検索チャット", href: "/admin/knowledge/chat" },
    ],
  },
  { label: "操作ログ", href: "/admin/logs" },
  {
    label: "ユーザー管理",
    href: "/admin/users",
    children: [
      { label: "LDユーザー", href: "/admin/users" },
      { label: "ポータルユーザー", href: "/admin/portal-users" },
    ],
  },
];

/** 指定パス配下がアクティブかを判定する */
function isChildActive(item: NavItem | NavChild, pathname: string): boolean {
  if (pathname === item.href || pathname.startsWith(item.href + "/")) return true;
  return item.children?.some((c) => isChildActive(c, pathname)) ?? false;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  function toggleMenu(key: string) {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  /** 子メニューが開いているかどうか（手動 or 配下がアクティブ） */
  function isOpen(item: NavItem | NavChild): boolean {
    if (openMenus[item.label] !== undefined) return openMenus[item.label];
    return isChildActive(item, pathname);
  }

  /** ナビリンクを描画 */
  function renderLink(item: NavChild, depth: number) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const pl = depth === 1 ? "pl-7" : depth === 2 ? "pl-11" : "pl-3";
    return (
      <Link
        key={item.href + item.label}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`block ${pl} pr-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
          isActive ? "font-semibold" : "text-white/70 hover:text-white"
        }`}
        style={
          isActive
            ? { color: "#FFF32D", backgroundColor: "rgba(255, 243, 45, 0.12)" }
            : undefined
        }
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "rgba(75, 135, 255, 0.25)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {item.label}
      </Link>
    );
  }

  /** ナビアイテムを再帰描画 */
  function renderNavItem(item: NavItem | NavChild, depth = 0) {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const pl = depth === 0 ? "pl-3" : depth === 1 ? "pl-7" : "pl-11";
    const expanded = hasChildren ? isOpen(item) : false;

    if (!hasChildren) {
      return renderLink(item, depth);
    }

    return (
      <div key={item.label}>
        {/* 親アイテム — クリックで開閉 & リンク */}
        <div className="flex items-center">
          <Link
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex-1 ${pl} pr-1 py-2 rounded-l-md text-sm transition-all duration-150 ${
              isActive ? "font-semibold" : "text-white/80 hover:text-white"
            }`}
            style={
              isActive
                ? { color: "#FFF32D", backgroundColor: "rgba(255, 243, 45, 0.12)" }
                : undefined
            }
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "rgba(75, 135, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {item.label}
          </Link>
          <button
            onClick={() => toggleMenu(item.label)}
            className="px-2 py-2 rounded-r-md text-white/60 hover:text-white transition-colors"
            aria-label={expanded ? "閉じる" : "開く"}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 子メニュー */}
        {expanded && (
          <div className="mt-0.5 space-y-0.5">
            {item.children!.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

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
        style={{
          background: "linear-gradient(to bottom, #002D37 0%, #050258 25%, #1B36AE 50%, #0048D9 75%, #002D37 100%)",
        }}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <Image
            src="/jobit-mascot.png"
            alt="Jobit マスコット"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-white font-bold text-lg tracking-wide">
            Jobit CRM
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </aside>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center">
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
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            ログアウト
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* AI Chat Widget */}
      <AiChatWidget />
    </div>
  );
}
