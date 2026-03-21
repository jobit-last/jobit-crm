import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Path,
  Font,
  StyleSheet,
  Rect,
} from "@react-pdf/renderer";
import path from "path";
import type { DiagnosisHearing } from "@/types/diagnosis";
import type { DiagnosisResult } from "@/app/api/diagnosis/analyze/route";

// ── Font registration (server-side only) ────────────────────────────────────
Font.register({
  family: "NotoSansJP",
  src: path.join(process.cwd(), "public/fonts/NotoSansJP-Regular.ttf"),
});

// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  main: "#002D37",
  accent: "#00A0B0",
  green: "#00E05D",
  amber: "#F59E0B",
  red: "#EF4444",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  border: "#BFCED1",
};

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Page
  page: { fontFamily: "NotoSansJP", backgroundColor: C.white, padding: 0 },

  // Cover
  cover: {
    backgroundColor: C.main,
    flex: 1,
    justifyContent: "space-between",
    padding: 48,
  },
  coverLogoArea: { flexDirection: "row", alignItems: "center", gap: 8 },
  coverLogoBox: {
    width: 32,
    height: 32,
    backgroundColor: C.green,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLogoText: { color: C.main, fontSize: 16, fontFamily: "NotoSansJP" },
  coverBrand: { color: C.white, fontSize: 18, fontFamily: "NotoSansJP" },
  coverCenter: { flex: 1, justifyContent: "center", gap: 16 },
  coverLabel: {
    color: C.green,
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "NotoSansJP",
  },
  coverTitle: {
    color: C.white,
    fontSize: 28,
    lineHeight: 1.4,
    fontFamily: "NotoSansJP",
  },
  coverDivider: {
    width: 48,
    height: 2,
    backgroundColor: C.accent,
    marginVertical: 8,
  },
  coverName: { color: C.white, fontSize: 20, fontFamily: "NotoSansJP" },
  coverDate: { color: "#9CA3AF", fontSize: 12, fontFamily: "NotoSansJP" },
  coverFooter: { color: "#6B7280", fontSize: 10, fontFamily: "NotoSansJP" },

  // Content pages
  contentPage: {
    fontFamily: "NotoSansJP",
    backgroundColor: C.white,
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 36,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.main,
  },
  pageHeaderTitle: {
    color: C.main,
    fontSize: 14,
    fontFamily: "NotoSansJP",
  },
  pageHeaderName: {
    color: C.gray,
    fontSize: 10,
    fontFamily: "NotoSansJP",
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    color: C.main,
    fontFamily: "NotoSansJP",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  // Score row
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginBottom: 8,
  },
  scoreLabelArea: { flex: 1 },
  scoreValue: {
    fontSize: 48,
    fontFamily: "NotoSansJP",
    lineHeight: 1,
  },
  scoreUnit: {
    fontSize: 14,
    color: C.gray,
    fontFamily: "NotoSansJP",
  },
  scoreEval: {
    fontSize: 12,
    fontFamily: "NotoSansJP",
    marginTop: 4,
  },
  scoreBarBg: {
    height: 12,
    backgroundColor: C.lightGray,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
  },
  scoreBarFill: {
    height: 12,
    borderRadius: 6,
  },

  // Salary
  salaryRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "baseline",
    marginBottom: 6,
  },
  salaryNum: {
    fontSize: 22,
    color: C.main,
    fontFamily: "NotoSansJP",
  },
  salaryLabel: {
    fontSize: 11,
    color: C.gray,
    fontFamily: "NotoSansJP",
  },
  salaryBarBg: {
    height: 20,
    backgroundColor: C.lightGray,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  salaryBarFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: C.accent,
    borderRadius: 10,
    opacity: 0.7,
  },
  salaryBarCurrent: {
    position: "absolute",
    top: 3,
    bottom: 3,
    width: 4,
    backgroundColor: C.amber,
    borderRadius: 2,
  },
  salaryNote: {
    fontSize: 9,
    color: C.gray,
    fontFamily: "NotoSansJP",
    marginTop: 4,
  },

  // Two columns
  twoCol: {
    flexDirection: "row",
    gap: 16,
  },
  col: { flex: 1 },
  colCard: {
    backgroundColor: C.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  colTitle: {
    fontSize: 10,
    color: C.main,
    fontFamily: "NotoSansJP",
    marginBottom: 8,
  },
  bullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 5,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 10,
    color: "#374151",
    fontFamily: "NotoSansJP",
    lineHeight: 1.5,
    flex: 1,
  },

  // Job cards
  jobCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  jobNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.main,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  jobNumText: {
    color: C.white,
    fontSize: 10,
    fontFamily: "NotoSansJP",
  },
  jobTitle: {
    fontSize: 11,
    color: C.main,
    fontFamily: "NotoSansJP",
    marginBottom: 3,
  },
  jobReason: {
    fontSize: 9,
    color: C.gray,
    fontFamily: "NotoSansJP",
    lineHeight: 1.5,
  },

  // Advice
  adviceBox: {
    backgroundColor: "#F0F9FA",
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    padding: 12,
    borderRadius: 4,
  },
  adviceText: {
    fontSize: 10,
    color: "#374151",
    fontFamily: "NotoSansJP",
    lineHeight: 1.7,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#9CA3AF",
    fontFamily: "NotoSansJP",
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return C.green;
  if (score >= 60) return C.accent;
  if (score >= 40) return C.amber;
  return C.red;
}

function scoreLabel(score: number) {
  if (score >= 80) return "非常に高い市場価値";
  if (score >= 60) return "高い市場価値";
  if (score >= 40) return "標準的な市場価値";
  return "成長の余地あり";
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = { x: cx + r * Math.cos((startDeg * Math.PI) / 180), y: cy + r * Math.sin((startDeg * Math.PI) / 180) };
  const e = { x: cx + r * Math.cos((endDeg * Math.PI) / 180), y: cy + r * Math.sin((endDeg * Math.PI) / 180) };
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// ── PDF Document ─────────────────────────────────────────────────────────────
export function DiagnosisPdfDocument({
  hearing,
  result,
}: {
  hearing: DiagnosisHearing;
  result: DiagnosisResult;
}) {
  const diagDate = new Date(hearing.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const col = scoreColor(result.score);
  const startAngle = 150;
  const totalAngle = 240;
  const filledAngle = startAngle + (totalAngle * result.score) / 100;

  // Salary bar positioning
  const base = Math.min(hearing.current_salary ?? result.salary_min, result.salary_min) * 0.85;
  const cap = result.salary_max * 1.15;
  const range = cap - base;
  const barLeft = ((result.salary_min - base) / range) * 100;
  const barWidth = ((result.salary_max - result.salary_min) / range) * 100;
  const currentLeft = hearing.current_salary
    ? Math.min(Math.max(((hearing.current_salary - base) / range) * 100, 1), 97)
    : null;

  return (
    <Document>
      {/* ── Page 1: Cover ──────────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          {/* Logo */}
          <View style={s.coverLogoArea}>
            <View style={s.coverLogoBox}>
              <Text style={s.coverLogoText}>J</Text>
            </View>
            <Text style={s.coverBrand}>Jobit CRM</Text>
          </View>

          {/* Title */}
          <View style={s.coverCenter}>
            <Text style={s.coverLabel}>AI MARKET VALUE REPORT</Text>
            <Text style={s.coverTitle}>AI市場価値{"\n"}診断レポート</Text>
            <View style={s.coverDivider} />
            <Text style={s.coverName}>{hearing.name} 様</Text>
            <Text style={s.coverDate}>診断日：{diagDate}</Text>
          </View>

          <Text style={s.coverFooter}>
            本レポートはAIによる診断結果です。参考情報としてご活用ください。
          </Text>
        </View>
      </Page>

      {/* ── Page 2: Score & Salary ─────────────────────────────────────── */}
      <Page size="A4" style={s.contentPage}>
        <View style={s.pageHeader}>
          <Text style={s.pageHeaderTitle}>市場価値スコア・想定年収レンジ</Text>
          <Text style={s.pageHeaderName}>{hearing.name} 様</Text>
        </View>

        {/* Score */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>市場価値スコア</Text>
          <View style={s.scoreRow}>
            {/* SVG gauge */}
            <Svg width={120} height={120} viewBox="0 0 200 200">
              <Path
                d={arcPath(100, 100, 75, startAngle, startAngle + totalAngle)}
                stroke={C.border}
                strokeWidth={18}
                strokeLinecap="round"
                fill="none"
              />
              {result.score > 0 && (
                <Path
                  d={arcPath(100, 100, 75, startAngle, filledAngle)}
                  stroke={col}
                  strokeWidth={18}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              <Rect x={55} y={72} width={90} height={50} fill="none" />
            </Svg>

            {/* Score text */}
            <View style={s.scoreLabelArea}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                <Text style={[s.scoreValue, { color: col }]}>{result.score}</Text>
                <Text style={s.scoreUnit}>/ 100点</Text>
              </View>
              <Text style={[s.scoreEval, { color: col }]}>{scoreLabel(result.score)}</Text>
              {/* Bar */}
              <View style={s.scoreBarBg}>
                <View
                  style={[s.scoreBarFill, { width: `${result.score}%`, backgroundColor: col }]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Salary */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>想定年収レンジ</Text>
          <View style={s.salaryRow}>
            <Text style={s.salaryNum}>{result.salary_min}</Text>
            <Text style={s.salaryLabel}>万円</Text>
            <Text style={[s.salaryLabel, { marginHorizontal: 4 }]}>〜</Text>
            <Text style={s.salaryNum}>{result.salary_max}</Text>
            <Text style={s.salaryLabel}>万円</Text>
          </View>

          {/* Bar visualization */}
          <View style={s.salaryBarBg}>
            <View
              style={[
                s.salaryBarFill,
                { left: `${barLeft}%`, width: `${barWidth}%` },
              ]}
            />
            {currentLeft !== null && (
              <View style={[s.salaryBarCurrent, { left: `${currentLeft}%` }]} />
            )}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            <Text style={s.salaryNote}>
              想定レンジ：{result.salary_min}〜{result.salary_max}万円
            </Text>
            {hearing.current_salary && (
              <Text style={[s.salaryNote, { color: C.amber }]}>
                現在：{hearing.current_salary}万円
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Jobit CRM | AI市場価値診断レポート</Text>
          <Text style={s.footerText}>{hearing.name} 様 | {diagDate}</Text>
        </View>
      </Page>

      {/* ── Page 3: Strengths, Gaps, Jobs ─────────────────────────────── */}
      <Page size="A4" style={s.contentPage}>
        <View style={s.pageHeader}>
          <Text style={s.pageHeaderTitle}>スキル分析・おすすめ職種</Text>
          <Text style={s.pageHeaderName}>{hearing.name} 様</Text>
        </View>

        {/* Strengths & Gaps */}
        <View style={[s.section, s.twoCol]}>
          {/* Strengths */}
          <View style={s.col}>
            <Text style={s.sectionLabel}>強み・スキル</Text>
            <View style={s.colCard}>
              {result.strengths.map((str, i) => (
                <View key={i} style={s.bullet}>
                  <View style={[s.bulletDot, { backgroundColor: C.green }]} />
                  <Text style={s.bulletText}>{str}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Gaps */}
          <View style={s.col}>
            <Text style={s.sectionLabel}>不足スキル・強化ポイント</Text>
            <View style={s.colCard}>
              {result.gaps.map((gap, i) => (
                <View key={i} style={s.bullet}>
                  <View style={[s.bulletDot, { backgroundColor: C.amber }]} />
                  <Text style={s.bulletText}>{gap}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recommended Jobs */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>おすすめ職種</Text>
          {result.recommended_jobs.map((job, i) => (
            <View key={i} style={s.jobCard}>
              <View style={s.jobNum}>
                <Text style={s.jobNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.jobTitle}>{job.title}</Text>
                <Text style={s.jobReason}>{job.reason}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Jobit CRM | AI市場価値診断レポート</Text>
          <Text style={s.footerText}>{hearing.name} 様 | {diagDate}</Text>
        </View>
      </Page>

      {/* ── Page 4: Career Advice ─────────────────────────────────────── */}
      <Page size="A4" style={s.contentPage}>
        <View style={s.pageHeader}>
          <Text style={s.pageHeaderTitle}>キャリアアドバイス</Text>
          <Text style={s.pageHeaderName}>{hearing.name} 様</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>総合キャリアアドバイス</Text>
          <View style={s.adviceBox}>
            <Text style={s.adviceText}>{result.career_advice}</Text>
          </View>
        </View>

        {/* Hearing summary */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ヒアリング情報サマリ</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              ["年齢", hearing.age ? `${hearing.age}歳` : "—"],
              ["最終学歴", hearing.education ?? "—"],
              ["業界", hearing.industry ?? "—"],
              ["職種", hearing.occupation ?? "—"],
              ["現在年収", hearing.current_salary ? `${hearing.current_salary}万円` : "—"],
              ["在籍年数", hearing.tenure_years ? `${hearing.tenure_years}年` : "—"],
              ["希望職種", hearing.desired_occupation ?? "—"],
              ["希望年収", hearing.desired_salary ? `${hearing.desired_salary}万円` : "—"],
              ["希望勤務地", hearing.desired_location ?? "—"],
              ["転職時期", hearing.desired_timing ?? "—"],
            ].map(([label, val]) => (
              <View
                key={label}
                style={{
                  width: "47%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4,
                  borderBottomWidth: 1,
                  borderBottomColor: C.border,
                }}
              >
                <Text style={{ fontSize: 9, color: C.gray, fontFamily: "NotoSansJP" }}>{label}</Text>
                <Text style={{ fontSize: 9, color: "#1A1A2E", fontFamily: "NotoSansJP" }}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={{ marginTop: 24, padding: 12, backgroundColor: C.lightGray, borderRadius: 6 }}>
          <Text style={{ fontSize: 8, color: C.gray, fontFamily: "NotoSansJP", lineHeight: 1.6 }}>
            ※ 本レポートはAI（Claude）による自動診断結果です。実際の市場価値は個人の具体的なスキルや経験、
            市場環境によって異なる場合があります。転職活動においては、本レポートを参考情報としてご活用ください。
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Jobit CRM | AI市場価値診断レポート</Text>
          <Text style={s.footerText}>{hearing.name} 様 | {diagDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
