import type { CandidateStatus } from "@/types/candidate";

const STEPS = [
  { key: "new", label: "登録", icon: "📝" },
  { key: "interview_scheduling", label: "面談調整", icon: "📅" },
  { key: "interviewed", label: "面談済み", icon: "💬" },
  { key: "applying", label: "応募", icon: "📨" },
  { key: "in_selection", label: "選考中", icon: "📋" },
  { key: "offered", label: "内定", icon: "🎉" },
  { key: "placed", label: "入社", icon: "🏢" },
] as const;

// ステータスの順序マップ
const STATUS_ORDER: Record<string, number> = {
  new: 0,
  interview_scheduling: 1,
  interviewed: 2,
  job_proposed: 2,
  applying: 3,
  in_selection: 4,
  offered: 5,
  placed: 6,
  failed: -1,
  closed: -1,
};

interface Props {
  candidateStatus: CandidateStatus;
}

export default function ProgressTimeline({ candidateStatus }: Props) {
  const currentIndex = STATUS_ORDER[candidateStatus] ?? 0;
  const isFailed = candidateStatus === "failed" || candidateStatus === "closed";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-8">
      <h2 className="text-sm font-semibold text-gray-600 mb-5">あなたの転職活動の進捗</h2>

      {/* デスクトップ: 横並び */}
      <div className="hidden sm:flex items-start justify-between relative">
        {/* 接続線 */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-8 h-0.5 transition-all duration-700"
          style={{
            width: isFailed ? "0%" : `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100 - 5)}%`,
            background: "linear-gradient(90deg, #16B1F3, #0649C4)",
          }}
        />

        {STEPS.map((step, i) => {
          const isDone = !isFailed && currentIndex >= i;
          const isCurrent = !isFailed && currentIndex === i;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: `${100 / STEPS.length}%` }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                  isCurrent
                    ? "ring-4 ring-blue-200 shadow-lg"
                    : ""
                }`}
                style={{
                  background: isDone
                    ? "linear-gradient(135deg, #16B1F3, #0649C4)"
                    : "#F3F4F6",
                  boxShadow: isCurrent ? "0 0 20px rgba(6, 73, 196, 0.3)" : undefined,
                }}
              >
                {isDone ? (
                  <span className="text-white text-sm">{i < currentIndex ? "✓" : step.icon}</span>
                ) : (
                  <span className="text-gray-400 text-sm">{step.icon}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center leading-tight ${
                  isCurrent ? "font-bold text-blue-600" : isDone ? "font-medium text-gray-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {isCurrent && (
                <span className="text-xs mt-1 px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#EBF5FF", color: "#2394FF" }}>
                  現在
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* モバイル: 縦並び */}
      <div className="sm:hidden space-y-0">
        {STEPS.map((step, i) => {
          const isDone = !isFailed && currentIndex >= i;
          const isCurrent = !isFailed && currentIndex === i;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    isCurrent ? "ring-3 ring-blue-200" : ""
                  }`}
                  style={{
                    background: isDone
                      ? "linear-gradient(135deg, #16B1F3, #0649C4)"
                      : "#F3F4F6",
                  }}
                >
                  {isDone ? (
                    <span className="text-white text-xs">{i < currentIndex ? "✓" : step.icon}</span>
                  ) : (
                    <span className="text-gray-400 text-xs">{step.icon}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className="w-0.5 h-6"
                    style={{
                      backgroundColor: isDone && currentIndex > i ? "#0649C4" : "#E5E7EB",
                    }}
                  />
                )}
              </div>
              <div className="pt-1">
                <span
                  className={`text-sm ${
                    isCurrent ? "font-bold text-blue-600" : isDone ? "font-medium text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#EBF5FF", color: "#2394FF" }}>
                    現在
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50 text-center">
          <p className="text-sm text-gray-500">
            現在のステータス: <span className="font-medium text-gray-700">{candidateStatus === "failed" ? "不合格" : "対応終了"}</span>
          </p>
        </div>
      )}
    </div>
  );
}
