import Link from "next/link";

const navItems = [
  { label: "求職者管理", href: "/admin/candidates" },
  { label: "選考管理", href: "/admin/applications" },
  { label: "スケジュール管理", href: "/admin/schedule" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      {/* サイドバー */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ backgroundColor: "#002D37" }}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="text-white font-bold text-lg tracking-wide">
            Jobit CRM
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
          <span className="text-sm" style={{ color: "#6B7280" }}>
            管理画面
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
