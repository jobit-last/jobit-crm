"use client";

import Link from "next/link";

const ACCENT = "#2394FF";
const MINT   = "#00B59A";
const GRAD_B = "linear-gradient(135deg, #16B1F3, #0649C4)";

// ─────────────────────────────────────────────
// データ定義
// ─────────────────────────────────────────────
const JOB_ROLES = [
  {
    id: "frontend",
    icon: "🖥",
    color: ACCENT,
    title: "フロントエンドエンジニア",
    tagline: "ユーザーが直接触れる画面を作る",
    description:
      "WebサイトやアプリのUI（見た目・操作性）を実装するエンジニア。HTML/CSS/JavaScript をベースに、React・Vue.js などのフレームワークを使って動的な画面を開発します。デザイナーとの協業が多く、UX（ユーザー体験）への感度も求められます。",
    skills: ["HTML / CSS", "JavaScript / TypeScript", "React or Vue.js", "Git", "Figmaの読み込み"],
    career: "Webデザイナー → フロントエンド → フルスタック / UIリード",
    salary: "400〜700万円",
    demand: "高い",
    demandColor: "#10B981",
    pros: ["成果が画面で見える", "デザインセンスが活かせる", "未経験からの参入例多数"],
    cons: ["ブラウザ・デバイス対応が複雑", "技術変化が速い"],
  },
  {
    id: "backend",
    icon: "⚙️",
    color: MINT,
    title: "バックエンドエンジニア",
    tagline: "アプリの心臓部・サーバーとDBを担う",
    description:
      "API・データベース・サーバーサイドロジックを構築するエンジニア。ユーザーからは見えない部分ですが、性能・セキュリティ・スケーラビリティに直結する重要な役割。Python・Go・Java・Node.js などを使用します。",
    skills: ["Python / Go / Java / Node.js", "REST API 設計", "SQL / PostgreSQL", "Docker", "認証・セキュリティ"],
    career: "バックエンド → アーキテクト / テックリード",
    salary: "450〜800万円",
    demand: "非常に高い",
    demandColor: "#10B981",
    pros: ["論理的な問題解決が楽しい", "高年収案件が多い", "言語の選択肢が広い"],
    cons: ["成果が見えにくい", "パフォーマンスチューニングは難難"],
  },
  {
    id: "fullstack",
    icon: "🔄",
    color: "#8B5CF6",
    title: "フルスタックエンジニア",
    tagline: "フロントからバックまで一人でこなす",
    description:
      "フロントエンドとバックエンドの両方を担当するエンジニア。スタートアップや小規模チームで特に重宝されます。Next.js + Node.js や Django + React などの構成が一般的。幅広いスキルが必要ですが、全体像を把握した開発ができます。",
    skills: ["フロント + バックエンド両方", "クラウド（AWS等）の基礎", "DB設計", "DevOps基礎"],
    career: "フルスタック → CTO / テックリード / 独立",
    salary: "500〜900万円",
    demand: "非常に高い",
    demandColor: "#10B981",
    pros: ["一人でプロダクトを作れる", "市場価値が高い", "独立・起業に有利"],
    cons: ["深い専門性を持ちにくい", "学習コストが高い"],
  },
  {
    id: "infra",
    icon: "☁️",
    color: "#F59E0B",
    title: "インフラ / SREエンジニア",
    tagline: "システムの安定稼働を支える縁の下の力持ち",
    description:
      "サーバー・ネットワーク・クラウド環境を設計・構築・運用するエンジニア。近年はAWS/GCP/Azureなどのクラウドスキルと、Kubernetes・Terraform などのインフラ自動化ツールの習得が必須。SRE（サイト信頼性エンジニアリング）の概念も重要です。",
    skills: ["AWS / GCP / Azure", "Linux / Networking", "Docker / Kubernetes", "Terraform / Ansible", "監視ツール（Datadog等）"],
    career: "インフラ → クラウドアーキテクト / SRE / セキュリティ",
    salary: "500〜900万円",
    demand: "高い",
    demandColor: "#10B981",
    pros: ["安定した大規模案件が多い", "資格でキャリアアップしやすい", "高年収"],
    cons: ["オンコール対応あり", "障害時プレッシャーが大きい"],
  },
  {
    id: "pm",
    icon: "📋",
    color: "#EF4444",
    title: "プロダクトマネージャー（PM）",
    tagline: "プロダクトの方向性を決めるリーダー",
    description:
      "プロダクトのビジョン策定・ロードマップ管理・開発優先度決定を担当。エンジニア・デザイナー・ビジネスチームを横断してプロジェクトを推進します。技術的素養と、ビジネス・ユーザー視点の両方が求められる役職です。",
    skills: ["要件定義・仕様策定", "データ分析（SQL/GA）", "コミュニケーション", "アジャイル / スクラム", "UXデザインの基礎"],
    career: "エンジニア / コンサル → PM → CPO / 事業責任者",
    salary: "600〜1,200万円",
    demand: "高い",
    demandColor: "#10B981",
    pros: ["高年収", "事業インパクトを直接感じられる", "コーディングが不要な場合も"],
    cons: ["責任範囲が広い", "成果が出るまで時間がかかる"],
  },
  {
    id: "designer",
    icon: "🎨",
    color: "#EC4899",
    title: "UI/UXデザイナー",
    tagline: "使いやすく美しいプロダクトをデザインする",
    description:
      "ユーザーインターフェース（UI）とユーザー体験（UX）を設計する職種。Figma・Adobe XDを使ったデザイン制作から、ユーザーリサーチ・プロトタイプ検証まで担当します。近年はデザインシステムの構築やエンジニアとの協業スキルも重要視されています。",
    skills: ["Figma / Adobe XD", "ユーザーリサーチ", "プロトタイピング", "デザインシステム構築", "HTML/CSSの基礎"],
    career: "デザイナー → UIリード / UXリサーチャー / デザインマネージャー",
    salary: "400〜700万円",
    demand: "普通〜高",
    demandColor: "#F59E0B",
    pros: ["クリエイティブな仕事", "ユーザーへの貢献が見える", "リモート案件多数"],
    cons: ["フィードバックが主観的になりやすい", "技術変化についていく必要がある"],
  },
  {
    id: "data",
    icon: "📊",
    color: "#0EA5E9",
    title: "データエンジニア / アナリスト",
    tagline: "データを価値あるインサイトに変える",
    description:
      "データの収集・加工・分析・可視化を担当。データエンジニアはデータ基盤の構築（BigQuery・Snowflake等）、データアナリストはBIツールやSQLを使った分析・レポートが中心。AIブームを背景に需要が急拡大中の職種です。",
    skills: ["SQL（必須）", "Python（pandas）", "BigQuery / Snowflake", "Tableau / Looker", "統計の基礎"],
    career: "アナリスト → データサイエンティスト / MLエンジニア",
    salary: "450〜800万円",
    demand: "非常に高い",
    demandColor: "#10B981",
    pros: ["AIブームで需要急増", "非エンジニア職からの転職例多数", "ビジネス理解が活かせる"],
    cons: ["統計・数学の素養が必要", "データ品質に依存する"],
  },
  {
    id: "qa",
    icon: "🔍",
    color: "#6366F1",
    title: "QAエンジニア / テストエンジニア",
    tagline: "品質を守り、バグのないプロダクトを届ける",
    description:
      "ソフトウェアの品質保証（QA）を担当するエンジニア。テスト計画の策定・テストケース作成・自動テストの構築（Selenium・Playwright等）を行います。品質文化が高まる中で注目度が上昇中の職種です。",
    skills: ["テスト設計", "Selenium / Playwright", "CI/CD（GitHub Actions等）", "バグレポート", "SQLの基礎"],
    career: "QA → テスト自動化エンジニア / SDETエンジニア",
    salary: "400〜650万円",
    demand: "普通〜高",
    demandColor: "#F59E0B",
    pros: ["品質という明確な目標", "コーディングが少ない入り口もある", "リモート案件多い"],
    cons: ["開発より後工程になりがち", "自動化スキルがないと単価が上がりにくい"],
  },
];

// ─────────────────────────────────────────────
// コンポーネント
// ─────────────────────────────────────────────
export default function JobsLearningPage() {
  return (
    <div style={{ backgroundColor: "#F2F6FF" }} className="min-h-screen">
      {/* ヒーロー — gradient B with white text */}
      <div
        className="rounded-b-3xl px-4 pt-14 pb-16 text-center"
        style={{ background: GRAD_B }}
      >
        <span
          className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
        >
          学習コンテンツ
        </span>
        <h1 className="text-3xl font-bold mb-3 text-white">
          IT職種ガイド
        </h1>
        <p className="text-white/80 text-sm max-w-lg mx-auto">
          フロントエンドからデータまで、主要なIT職種を徹底解説。自分に合った職種を見つけましょう。
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Link
            href="/portal/learning/it"
            className="text-sm font-medium px-5 py-2.5 rounded-xl border-2 border-white/40 text-white transition-colors hover:bg-white/10"
          >
            IT業界の基礎を学ぶ →
          </Link>
          <Link
            href="/portal/jobs/search"
            className="text-sm font-medium px-5 py-2.5 rounded-xl bg-white shadow-md transition-opacity hover:opacity-90"
            style={{ color: "#0649C4" }}
          >
            求人を探す
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {/* 職種インデックス — vibrant pills */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-10">
          <p className="text-xs font-semibold mb-3" style={{ color: "#16B1F3" }}>職種一覧</p>
          <div className="flex flex-wrap gap-2">
            {JOB_ROLES.map((r) => (
              <a
                key={r.id}
                href={`#${r.id}`}
                className="text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${r.color}18, ${r.color}08)`,
                  border: `1.5px solid ${r.color}40`,
                  color: r.color,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `linear-gradient(135deg, ${r.color}, ${r.color}cc)`;
                  (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = r.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `linear-gradient(135deg, ${r.color}18, ${r.color}08)`;
                  (e.currentTarget as HTMLAnchorElement).style.color = r.color;
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `${r.color}40`;
                }}
              >
                {r.icon} {r.title}
              </a>
            ))}
          </div>
        </div>

        {/* 職種カード */}
        <div className="space-y-8">
          {JOB_ROLES.map((role) => (
            <div
              key={role.id}
              id={role.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden scroll-mt-20"
            >
              {/* Colored top accent bar — subtle gradient */}
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${role.color}, ${role.color}66)` }} />

              {/* ヘッダー */}
              <div
                className="px-6 py-5"
                style={{ backgroundColor: role.color + "08", borderBottom: `1px solid ${role.color}15` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl shrink-0">{role.icon}</span>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#21242B" }}>
                        {role.title}
                      </h2>
                      <p className="text-sm mt-0.5" style={{ color: role.color }}>
                        {role.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs ml-0 sm:ml-auto shrink-0">
                    <div className="text-center px-3 py-2 rounded-xl" style={{ backgroundColor: "#E8F0F6" }}>
                      <p className="text-gray-400 mb-0.5">想定年収</p>
                      <p className="font-bold" style={{ color: "#21242B" }}>{role.salary}</p>
                    </div>
                    <div className="text-center px-3 py-2 rounded-xl" style={{ backgroundColor: `${role.demandColor}10` }}>
                      <p className="text-gray-400 mb-0.5">需要</p>
                      <p className="font-bold" style={{ color: role.demandColor }}>{role.demand}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* 説明 */}
                <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 必要スキル */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#E8F0F6" }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#16B1F3" }}>
                      求められるスキル
                    </h3>
                    <ul className="space-y-1">
                      {role.skills.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* メリット */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: `${MINT}08` }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: MINT }}>
                      この職種のメリット
                    </h3>
                    <ul className="space-y-1">
                      {role.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-gray-600">
                          <span style={{ color: MINT }} className="shrink-0 mt-0.5 font-bold">&#10003;</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* デメリット + キャリアパス */}
                  <div className="space-y-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: "#FEF3C7" }}>
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#D97706" }}>
                        注意点
                      </h3>
                      <ul className="space-y-1">
                        {role.cons.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-yellow-500 shrink-0 mt-0.5 font-bold">{"\u25B3"}</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        キャリアパス
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{role.career}</p>
                    </div>
                  </div>
                </div>

                {/* 求人を見るボタン — gradient B */}
                <div className="pt-2 border-t border-gray-50">
                  <Link
                    href={`/portal/jobs/search?job_type=${encodeURIComponent(role.title)}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                    style={{ background: GRAD_B }}
                  >
                    {role.title}の求人を見る →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — gradient B */}
        <div
          className="rounded-2xl p-8 text-center text-white mt-12 mb-8 shadow-lg"
          style={{ background: GRAD_B }}
        >
          <p className="text-lg font-bold mb-2">気になる職種は見つかりましたか？</p>
          <p className="text-sm opacity-80 mb-6">担当CAにご相談いただけます。一緒に最適なキャリアを考えましょう。</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/portal/learning/it"
              className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/30"
            >
              IT業界を学ぶ
            </Link>
            <Link
              href="/portal/jobs/search"
              className="bg-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-opacity hover:opacity-90"
              style={{ color: "#0649C4" }}
            >
              求人を探す
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
