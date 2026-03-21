import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PortalDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#1E293B" }}>
        マイページ
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* 選考状況 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">選考状況</h2>
          <p className="text-3xl font-bold" style={{ color: "#0649C4" }}>
            —
          </p>
          <p className="mt-1 text-xs text-gray-400">進行中の選考</p>
        </div>

        {/* 面接予定 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">面接予定</h2>
          <p className="text-3xl font-bold" style={{ color: "#16B1F3" }}>
            —
          </p>
          <p className="mt-1 text-xs text-gray-400">直近の面接</p>
        </div>

        {/* 提案求人 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">提案求人</h2>
          <p className="text-3xl font-bold" style={{ color: "#0649C4" }}>
            —
          </p>
          <p className="mt-1 text-xs text-gray-400">紹介された求人</p>
        </div>
      </div>

      {/* お知らせ */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#1E293B" }}>
          お知らせ
        </h2>
        <p className="text-sm text-gray-400 text-center py-8">
          現在お知らせはありません
        </p>
      </div>
    </div>
  );
}
