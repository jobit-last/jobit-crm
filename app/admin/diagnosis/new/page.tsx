import Link from "next/link";
import DiagnosisForm from "./_components/DiagnosisForm";

export default function DiagnosisNewPage() {
  return (
    <div>
      {/* パンくず */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#6B7280" }}>
        <Link href="/admin/candidates" className="hover:underline" style={{ color: "#00A0B0" }}>
          求職者管理
        </Link>
        <span>/</span>
        <span style={{ color: "#1A1A2E" }}>AI市場価値診断ヒアリング</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#1A1A2E" }}>
          AI市場価値診断ヒアリングフォーム
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          求職者の情報を4ステップで入力してください。入力内容をもとに市場価値を診断します。
        </p>
      </div>

      <DiagnosisForm />
    </div>
  );
}
