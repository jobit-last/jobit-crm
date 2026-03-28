interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  prevValue?: number;
  target?: number;
}

export default function KpiCard({ label, value, icon, color, prevValue, target }: KpiCardProps) {
  const hasPrev = prevValue !== undefined && prevValue !== null;
  const delta = hasPrev ? value - prevValue : 0;
  const deltaRate = hasPrev && prevValue > 0 ? Math.round((delta / prevValue) * 100) : hasPrev && prevValue === 0 && value > 0 ? 100 : 0;
  const isUp = delta > 0;
  const isDown = delta < 0;

  const hasTarget = target !== undefined && target !== null && target > 0;
  const achieveRate = hasTarget ? Math.min(Math.round((value / target) * 100), 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: color + "20" }}
        >
          {icon}
        </div>
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
      </div>

      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold" style={{ color }}>
          {value.toLocaleString()}
        </p>
        {hasPrev && (
          <span
            className={`text-xs font-semibold pb-1 ${isUp ? "text-emerald-500" : isDown ? "text-red-500" : "text-gray-400"}`}
          >
            {isUp ? "▲" : isDown ? "▼" : "→"}{" "}
            {Math.abs(deltaRate)}%
            <span className="text-gray-400 font-normal ml-0.5">
              (前月{prevValue})
            </span>
          </span>
        )}
      </div>

      {hasTarget && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">目標: {target}</span>
            <span className={`font-semibold ${achieveRate >= 100 ? "text-emerald-500" : achieveRate >= 70 ? "text-amber-500" : "text-red-500"}`}>
              {achieveRate}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${achieveRate}%`,
                backgroundColor: achieveRate >= 100 ? "#10B981" : achieveRate >= 70 ? "#F59E0B" : "#EF4444",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
