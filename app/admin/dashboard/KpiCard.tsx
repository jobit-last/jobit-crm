interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export default function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: color + "20" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold" style={{ color }}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
