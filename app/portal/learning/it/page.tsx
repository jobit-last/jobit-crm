import Link from "next/link";

const ACCENT = "#2394FF";
const MINT   = "#00B59A";
const GRAD_B = "linear-gradient(135deg, #16B1F3, #0649C4)";

// ─────────────────────────────────────────────
// データ定義
// ─────────────────────────────────────────────
const OVERVIEW_CARDS = [
  {
    icon: "🌐",
    title: "IT業界とは",
    body: "IT（情報技術）業界は、ソフトウェア・ハードウェア・ネットワーク・データなどを扱う産業の総称です。スマートフォン・クラウド・AI の普及により、あらゆる業種でIT化が進んでいます。",
  },
  {
    icon: "📈",
    title: "市場規模と成長性",
    body: "国内IT市場は20兆円超。DX（デジタルトランスフォーメーション）需要を背景に年率5〜7%で拡大中。エンジニア不足が深刻で、未経験からの転職需要も高まっています。",
  },
  {
    icon: "🏢",
    title: "主な業態",
    body: "①自社サービス（Web系・SaaS）②SIer（受託開発）③コンサルティング④ITベンダー。働き方・カルチャーが大きく異なるため、転職先選びで重要なポイントです。",
  },
  {
    icon: "💼",
    title: "雇用の特徴",
    body: "リモートワーク・フレックス制が普及。副業・フリーランスも一般的。スキル次第で年収アップが狙いやすく、30代・40代の転職成功事例も多数。",
  },
];

const TECH_STACKS = [
  {
    color: ACCENT,
    category: "フロントエンド",
    icon: "🖥",
    items: [
      { name: "HTML / CSS", desc: "Webページの構造とデザインを記述する基礎言語。すべてのWeb開発の土台。" },
      { name: "JavaScript / TypeScript", desc: "Webブラウザ上で動くプログラミング言語。TypeScriptは型安全性を加えた上位互換。" },
      { name: "React / Next.js", desc: "Meta製UIライブラリと、それを使ったフルスタックフレームワーク。現在最も需要が高い。" },
      { name: "Vue.js / Nuxt.js", desc: "日本企業での採用率が高いフレームワーク。学習コストが低く初心者にも人気。" },
    ],
  },
  {
    color: MINT,
    category: "バックエンド",
    icon: "⚙️",
    items: [
      { name: "Node.js", desc: "JavaScriptをサーバーサイドで動かす環境。フロント・バックを同一言語で書ける強み。" },
      { name: "Python / Django / FastAPI", desc: "AI・機械学習との親和性が高い。Web APIの構築にも広く使われる。" },
      { name: "Go（Golang）", desc: "Googleが開発。高速・軽量で大規模サービスのバックエンドに採用増。" },
      { name: "Java / Spring Boot", desc: "大手・金融・エンタープライズで根強い需要。安定した案件が多い。" },
    ],
  },
  {
    color: "#8B5CF6",
    category: "クラウド / インフラ",
    icon: "☁️",
    items: [
      { name: "AWS（Amazon Web Services）", desc: "クラウドシェアNo.1。EC2・S3・RDSなど200以上のサービスを提供。資格試験も人気。" },
      { name: "GCP（Google Cloud）", desc: "AI・BigQueryなどデータ分析に強み。機械学習系の案件で需要増。" },
      { name: "Azure（Microsoft）", desc: "エンタープライズ・Microsoft製品との連携が強み。大企業採用が多い。" },
      { name: "Docker / Kubernetes", desc: "コンテナ技術。環境の再現性を高め、デプロイを効率化。現代開発の必須スキル。" },
    ],
  },
  {
    color: "#F59E0B",
    category: "データベース",
    icon: "🗄",
    items: [
      { name: "PostgreSQL / MySQL", desc: "最も広く使われるリレーショナルDB。Webアプリの標準的なデータ保管先。" },
      { name: "MongoDB", desc: "JSON形式でデータを保存するNoSQL DB。柔軟なスキーマが特徴。" },
      { name: "Redis", desc: "インメモリDB。キャッシュ・セッション管理に使われる超高速データストア。" },
      { name: "BigQuery / Snowflake", desc: "大量データ分析用のクラウドDWH。データエンジニア・アナリストに必須。" },
    ],
  },
  {
    color: "#EF4444",
    category: "AI / データサイエンス",
    icon: "🤖",
    items: [
      { name: "機械学習（ML）", desc: "データからパターンを学習するAI技術。推薦・需要予測・画像認識など幅広く活用。" },
      { name: "LLM / 生成AI", desc: "ChatGPT・Claude等の大規模言語モデル。ビジネス活用・プロダクト組み込みで急成長中。" },
      { name: "Python（pandas / numpy）", desc: "データ分析の基本ライブラリ。CSVや統計処理から機械学習の前処理まで。" },
      { name: "Tableau / Looker Studio", desc: "データを可視化するBIツール。非エンジニアでも使えるため普及率が高い。" },
    ],
  },
];

const KEYWORDS = [
  { word: "DX（デジタルトランスフォーメーション）", desc: "業務プロセスや企業文化をデジタル技術で刷新すること" },
  { word: "アジャイル開発", desc: "短いサイクルでリリースを繰り返す開発手法。スクラムが代表的" },
  { word: "CI/CD", desc: "コードのビルド・テスト・デプロイを自動化する仕組み" },
  { word: "API", desc: "システム間の通信インターフェース。REST APIが主流" },
  { word: "SaaS / PaaS / IaaS", desc: "クラウドサービスの提供形態の分類" },
  { word: "OSS（オープンソース）", desc: "誰でも無料で使えるソースコードが公開されたソフトウェア" },
];

// ─────────────────────────────────────────────
// コンポーネント
// ─────────────────────────────────────────────
export default function ITLearningPage() {
  return (
    <div style={{ backgroundColor: "#F2F6FF" }} className="min-h-screen">
      {/* ヒーロー — gradient B */}
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
          IT業界の基礎知識
        </h1>
        <p className="text-white/80 text-sm max-w-lg mx-auto">
          IT業界への転職を考えているあなたへ。業界の構造から主要技術まで、わかりやすく解説します。
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Link
            href="/portal/learning/jobs"
            className="text-sm font-medium px-5 py-2.5 rounded-xl border-2 border-white/40 text-white transition-colors hover:bg-white/10"
          >
            職種説明を見る →
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
        {/* 業界概要 */}
        <section className="mb-14">
          <SectionTitle color="#16B1F3">IT業界の全体像</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OVERVIEW_CARDS.map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5"
                style={{ borderLeft: `4px solid ${ACCENT}` }}
              >
                <div className="text-2xl mb-2">{c.icon}</div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "#21242B" }}>{c.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 技術スタック */}
        <section className="mb-14 rounded-2xl p-6" style={{ backgroundColor: "#E8F0F6" }}>
          <SectionTitle color="#16B1F3">主要な技術スタック</SectionTitle>
          <div className="space-y-6">
            {TECH_STACKS.map((stack) => (
              <div key={stack.category} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* カテゴリヘッダー — colored top accent bar */}
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${stack.color}, ${stack.color}88)` }} />
                <div
                  className="flex items-center gap-3 px-6 py-4"
                  style={{ backgroundColor: stack.color + "0c" }}
                >
                  <span className="text-xl">{stack.icon}</span>
                  <h3 className="text-base font-bold" style={{ color: stack.color }}>
                    {stack.category}
                  </h3>
                </div>
                {/* アイテム */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-x-0 sm:divide-x divide-y divide-gray-50">
                  {stack.items.map((item) => (
                    <div key={item.name} className="px-6 py-4 border-b border-gray-50 last:border-b-0 sm:last:border-b-0">
                      <p className="text-sm font-semibold mb-1" style={{ color: stack.color }}>
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* IT用語集 */}
        <section className="mb-14">
          <SectionTitle color="#16B1F3">よく聞くIT用語</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {KEYWORDS.map((kw, i) => (
              <div
                key={kw.word}
                className={`flex flex-col sm:flex-row gap-2 sm:gap-4 px-4 sm:px-6 py-4`}
                style={{ backgroundColor: i % 2 === 1 ? "#E8F0F6" : undefined }}
              >
                <dt className="shrink-0 sm:w-52">
                  <span
                    className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${MINT}18`, color: MINT }}
                  >
                    {kw.word}
                  </span>
                </dt>
                <dd className="text-xs text-gray-500 leading-relaxed pt-0.5">{kw.desc}</dd>
              </div>
            ))}
          </div>
        </section>

        {/* 次のステップ — gradient B */}
        <div
          className="rounded-2xl p-8 text-center text-white shadow-lg mb-8"
          style={{ background: GRAD_B }}
        >
          <p className="text-lg font-bold mb-2">知識を身につけたら次のステップへ</p>
          <p className="text-sm opacity-80 mb-6">担当CAがあなたに合った求人をご紹介します</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/portal/learning/jobs"
              className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/30"
            >
              職種を知る
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

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-8">
      <div className="w-1.5 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${color}, ${color}66)` }} />
      <h2 className="text-lg font-bold" style={{ color: "#16B1F3" }}>{children}</h2>
    </div>
  );
}
