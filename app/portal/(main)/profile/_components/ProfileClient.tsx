"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Candidate } from "@/types/candidate";
import { STATUS_LABELS, STATUS_COLORS, GENDER_LABELS } from "@/types/candidate";

interface Props {
  candidate: Candidate;
}

export default function ProfileClient({ candidate }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(candidate.phone ?? "");
  const [desiredSalary, setDesiredSalary] = useState(
    candidate.desired_salary?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/portal/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, desired_salary: desiredSalary }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "更新に失敗しました");
      return;
    }

    setSaved(true);
    setEditing(false);
    startTransition(() => router.refresh());
  }

  function handleCancel() {
    setPhone(candidate.phone ?? "");
    setDesiredSalary(candidate.desired_salary?.toString() ?? "");
    setEditing(false);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          プロフィールを更新しました
        </div>
      )}

      {/* 基本情報（読み取り専用） */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#1E293B" }}>
          基本情報
        </h2>
        <dl className="space-y-3">
          <InfoRow label="氏名" value={candidate.name} />
          <InfoRow label="メールアドレス" value={candidate.email} />
          <InfoRow
            label="生年月日"
            value={
              candidate.birth_date
                ? new Date(candidate.birth_date).toLocaleDateString("ja-JP")
                : null
            }
          />
          <InfoRow
            label="性別"
            value={candidate.gender ? GENDER_LABELS[candidate.gender] : null}
          />
          <InfoRow label="現在の会社" value={candidate.current_company} />
          <InfoRow
            label="現在の年収"
            value={
              candidate.current_salary != null
                ? `${candidate.current_salary.toLocaleString()} 万円`
                : null
            }
          />
          <InfoRow label="担当CA" value={candidate.ca?.full_name ?? null} />
          <InfoRow label="ステータス">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[candidate.status]}`}
            >
              {STATUS_LABELS[candidate.status]}
            </span>
          </InfoRow>
        </dl>
      </section>

      {/* 編集可能な情報 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "#1E293B" }}>
            連絡先・希望条件
          </h2>
          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setSaved(false);
              }}
              className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: "#2394FF", backgroundColor: "#EBF5FF" }}
            >
              編集する
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090-0000-0000"
                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2394FF]/30 focus:border-[#2394FF] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望年収（万円）
              </label>
              <input
                type="number"
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(e.target.value)}
                placeholder="600"
                min={0}
                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2394FF]/30 focus:border-[#2394FF] transition"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#2394FF" }}
              >
                {saving ? "保存中..." : "保存する"}
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <dl className="space-y-3">
            <InfoRow label="電話番号" value={candidate.phone} />
            <InfoRow
              label="希望年収"
              value={
                candidate.desired_salary != null
                  ? `${candidate.desired_salary.toLocaleString()} 万円`
                  : null
              }
            />
          </dl>
        )}
      </section>

      {/* 登録情報 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#1E293B" }}>
          登録情報
        </h2>
        <dl className="space-y-3">
          <InfoRow
            label="登録日"
            value={new Date(candidate.created_at).toLocaleDateString("ja-JP")}
          />
          <InfoRow
            label="最終更新"
            value={new Date(candidate.updated_at).toLocaleDateString("ja-JP")}
          />
        </dl>
      </section>
    </div>
  );
}

function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <dt className="w-32 flex-shrink-0 text-sm font-medium text-gray-400">
        {label}
      </dt>
      <dd className="text-sm" style={{ color: value || children ? "#1E293B" : "#9CA3AF" }}>
        {children ?? value ?? "—"}
      </dd>
    </div>
  );
}
