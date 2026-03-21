import type { ContractStatus } from "@/types/contract";

const STATUS_CONFIG: Record<ContractStatus, { label: string; className: string }> = {
  draft: { label: "下書き", className: "bg-gray-100 text-gray-700" },
  active: { label: "有効", className: "bg-green-100 text-green-700" },
  expired: { label: "期限切れ", className: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }: { status: ContractStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
