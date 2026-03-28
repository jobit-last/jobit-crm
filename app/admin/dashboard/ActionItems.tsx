"use client";

import Link from "next/link";

interface FollowUpItem {
  id: string;
  name: string;
  status: string;
  updated_at: string;
  ca?: { name: string } | null;
}

interface InterviewItem {
  id: string;
  scheduled_at: string;
  application?: {
    candidate?: { name: string } | null;
    job?: { title: string; company?: { name: string } | null } | null;
  } | null;
}

interface ActionItemsProps {
  needFollowUp: FollowUpItem[];
  upcomingInterviews: InterviewItem[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "新規登録",
  interview_scheduling: "面談調整中",
  interviewed: "面談済み",
  job_proposed: "求人提案中",
  applying: "応募中",
  in_selection: "選考中",
  offered: "内定",
  placed: "入社",
  failed: "不合格",
  closed: "対応終了",
};

function daysAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "今日";
  if (diff === 1) return "昨日";
  return diff + "日前";
}

export default function ActionItems({ needFollowUp, upcomingInterviews }: ActionItemsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* フォロー必要 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            フォローが必要な求職者
          </h2>
          <span className="text-xs text-gray-400">{needFollowUp.length}件</span>
        </div>
        {needFollowUp.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">対応漏れはありません</p>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {needFollowUp.map((c) => (
              <Link
                key={c.id}
                href={"/admin/candidates/" + c.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {STATUS_LABELS[c.status] ?? c.status}
                    {c.ca && <span className="ml-2">担当: {c.ca.name}</span>}
                  </p>
                </div>
                <span className="text-xs text-red-500 font-medium flex-shrink-0">
                  {daysAgo(c.updated_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 今週の面接 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            今週の面接予定
          </h2>
          <span className="text-xs text-gray-400">{upcomingInterviews.length}件</span>
        </div>
        {upcomingInterviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">予定なし</p>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {upcomingInterviews.map((iv) => {
              const dt = new Date(iv.scheduled_at);
              return (
                <div
                  key={iv.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {iv.application?.candidate?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {iv.application?.job?.title ?? "—"}
                      {iv.application?.job?.company?.name && (" @ " + iv.application.job.company.name)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-semibold text-blue-600">
                      {dt.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {dt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
