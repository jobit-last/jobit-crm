import {
  Document,
  Page,
  View,
  Text,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import path from "path";
import type { ResumeContent } from "@/types/resume";

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
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  border: "#E5E7EB",
};

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    backgroundColor: C.white,
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 50,
  },
  // Header
  header: {
    backgroundColor: C.main,
    marginHorizontal: -40,
    marginTop: -36,
    paddingHorizontal: 40,
    paddingVertical: 24,
    marginBottom: 24,
  },
  headerTitle: {
    color: C.white,
    fontSize: 22,
    fontFamily: "NotoSansJP",
  },
  headerSub: {
    color: "#9CA3AF",
    fontSize: 10,
    fontFamily: "NotoSansJP",
    marginTop: 4,
  },
  // Section
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: C.main,
    fontFamily: "NotoSansJP",
    paddingBottom: 6,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: C.main,
  },
  sectionBody: {
    fontSize: 10,
    color: "#374151",
    fontFamily: "NotoSansJP",
    lineHeight: 1.7,
  },
  // Basic info
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 10,
    color: C.gray,
    fontFamily: "NotoSansJP",
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
    color: "#1A1A2E",
    fontFamily: "NotoSansJP",
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

interface CandidateInfo {
  name: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
}

export function ResumePdfDocument({
  candidate,
  content,
  version,
}: {
  candidate: CandidateInfo;
  content: ResumeContent;
  version: number;
}) {
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const genderLabel =
    candidate.gender === "male"
      ? "男性"
      : candidate.gender === "female"
      ? "女性"
      : candidate.gender === "other"
      ? "その他"
      : null;

  const sections = [
    { title: "自己PR", body: content.summary },
    { title: "職務経歴", body: content.work_history },
    { title: "スキル・技術", body: content.skills },
    { title: "学歴", body: content.education },
    { title: "資格", body: content.certifications },
  ].filter((sec) => sec.body);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>履歴書</Text>
          <Text style={s.headerSub}>
            {candidate.name} | v{version} | {today}
          </Text>
        </View>

        {/* 基本情報 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>基本情報</Text>
          {[
            ["氏名", candidate.name],
            ["メール", candidate.email],
            ["電話番号", candidate.phone],
            [
              "生年月日",
              candidate.birth_date
                ? new Date(candidate.birth_date).toLocaleDateString("ja-JP")
                : null,
            ],
            ["性別", genderLabel],
          ]
            .filter(([, v]) => v)
            .map(([label, val]) => (
              <View key={label as string} style={s.infoRow}>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>{val}</Text>
              </View>
            ))}
        </View>

        {/* コンテンツセクション */}
        {sections.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <Text style={s.sectionBody}>{sec.body}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Jobit CRM | 履歴書</Text>
          <Text style={s.footerText}>
            {candidate.name} | {today}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
