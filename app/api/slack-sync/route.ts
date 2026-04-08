import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// RLSをバイパスするためservice role keyを使用
function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Slack API設定
const SLACK_API_BASE = "https://slack.com/api";
const SLACK_CHANNEL_ID = process.env.SLACK_PIT_CAREER_CHANNEL_ID || "C080T4MGGN7";

// ===== ヘルパー =====

// 都道府県を抽出（"東京・神奈川・千葉・埼玉" → "東京都"）
function extractPrefecture(text: string | null): string | null {
  if (!text) return null;
  const map: Record<string, string> = {
    "北海道": "北海道",
    "青森": "青森県", "岩手": "岩手県", "宮城": "宮城県", "秋田": "秋田県",
    "山形": "山形県", "福島": "福島県",
    "茨城": "茨城県", "栃木": "栃木県", "群馬": "群馬県",
    "埼玉": "埼玉県", "千葉": "千葉県", "東京": "東京都", "神奈川": "神奈川県",
    "新潟": "新潟県", "富山": "富山県", "石川": "石川県", "福井": "福井県",
    "山梨": "山梨県", "長野": "長野県", "岐阜": "岐阜県", "静岡": "静岡県",
    "愛知": "愛知県", "三重": "三重県",
    "滋賀": "滋賀県", "京都": "京都府", "大阪": "大阪府", "兵庫": "兵庫県",
    "奈良": "奈良県", "和歌山": "和歌山県",
    "鳥取": "鳥取県", "島根": "島根県", "岡山": "岡山県", "広島": "広島県", "山口": "山口県",
    "徳島": "徳島県", "香川": "香川県", "愛媛": "愛媛県", "高知": "高知県",
    "福岡": "福岡県", "佐賀": "佐賀県", "長崎": "長崎県", "熊本": "熊本県",
    "大分": "大分県", "宮崎": "宮崎県", "鹿児島": "鹿児島県", "沖縄": "沖縄県",
  };
  for (const [key, val] of Object.entries(map)) {
    if (text.includes(key)) return val;
  }
  return null;
}

// 生年月日を年齢から推定（YYYY-01-01）
function estimateBirthDate(age: number | null): string | null {
  if (!age) return null;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

// 日本語日付をISO日付に変換 "2026年4月8日(水) 19:30 - 20:00" → { date, time }
function parseJapaneseDateTime(text: string): { date: string | null; time: string | null } {
  const dateMatch = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*-\s*\d{1,2}:\d{2}/);

  let date: string | null = null;
  if (dateMatch) {
    const y = dateMatch[1];
    const m = dateMatch[2].padStart(2, "0");
    const d = dateMatch[3].padStart(2, "0");
    date = `${y}-${m}-${d}`;
  }

  let time: string | null = null;
  if (timeMatch) {
    time = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}:00`;
  }

  return { date, time };
}

// 電話番号を正規化
function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/[-\s\u30fc\uff0d]/g, "");
}

// ===== Slackメッセージパーサー =====

interface ParsedCandidate {
  name: string;
  email: string | null;
  phone: string | null;
  age: number | null;
  interview_date: string | null;
  interview_time: string | null;
  interview_url: string | null;
  prefecture: string | null;
  transfer_timing: string | null;
  nationality: string | null;
  work_restrictions: string | null;
  raw_text: string;
  slack_ts: string;
}

function parseSlackMessage(text: string, ts: string): ParsedCandidate | null {
  // Slackのフォーマット記号を除去 + マークダウンの太字記号(*)を除去
  const cleanText = text
    .replace(/<([^|>]+)\|([^>]+)>/g, "$2")
    .replace(/<([^>]+)>/g, "$1")
    .replace(/\*/g, "");

  // 名前: "下村幹太 さんとの" の形式
  const nameMatch = cleanText.match(/^\s*(.+?)\s*さんとの/);
  if (!nameMatch) return null; // パースできない場合はスキップ

  const name = nameMatch[1].trim();

  // 日時
  const dateTimeMatch = cleanText.match(/日時[:：]\s*([^\n]+)/);
  const dateTime = dateTimeMatch
    ? parseJapaneseDateTime(dateTimeMatch[1])
    : { date: null, time: null };

  // メールアドレス
  const emailMatch = cleanText.match(/メールアドレス[:：]\s*([^\s\n]+)/);
  const email = emailMatch ? emailMatch[1].trim() : null;

  // Google Meet URL
  const urlMatch = cleanText.match(/(https:\/\/meet\.google\.com\/[\w-]+)/);
  const interview_url = urlMatch ? urlMatch[1] : null;

  // 電話番号
  const phoneMatch = cleanText.match(/電話番号[:：]\s*([\d\-\s]+)/);
  const phone = phoneMatch ? normalizePhone(phoneMatch[1]) : null;

  // 年齢
  const ageMatch = cleanText.match(/年齢[^:：]*[:：]\s*(\d+)\s*歳/);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : null;

  // 転職時期
  const timingMatch = cleanText.match(/転職時期[^:：]*[:：]\s*([^\n]+?)(?=\s*(?:希望勤務地|国籍|通院|$))/);
  const transfer_timing = timingMatch ? timingMatch[1].trim() : null;

  // 希望勤務地
  const locationMatch = cleanText.match(/希望勤務地[^:：]*[:：]\s*([^\n]+?)(?=\s*(?:国籍|通院|$))/);
  const locationText = locationMatch ? locationMatch[1].trim() : null;
  const prefecture = extractPrefecture(locationText);

  // 国籍
  const nationalityMatch = cleanText.match(/国籍[^:：]*[:：]\s*([^\n]+?)(?=\s*(?:通院|$))/);
  const nationality = nationalityMatch ? nationalityMatch[1].trim() : null;

  // 勤務制限
  const restrictionMatch = cleanText.match(/通院[^:：]*[:：]\s*([^\n]+?)(?=\s*$|\n)/);
  const work_restrictions = restrictionMatch ? restrictionMatch[1].trim() : null;

  return {
    name,
    email,
    phone,
    age,
    interview_date: dateTime.date,
    interview_time: dateTime.time,
    interview_url,
    prefecture,
    transfer_timing,
    nationality,
    work_restrictions,
    raw_text: cleanText,
    slack_ts: ts,
  };
}

// ===== Slack API =====

async function fetchSlackMessages(oldestTs?: string): Promise<any[]> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error("SLACK_BOT_TOKEN が環境変数に設定されていません");
  }

  const params = new URLSearchParams({
    channel: SLACK_CHANNEL_ID,
    limit: "100",
  });
  if (oldestTs) {
    params.set("oldest", oldestTs);
  }

  const res = await fetch(`${SLACK_API_BASE}/conversations.history?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  if (!res.ok) {
    throw new Error(`Slack API error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data.messages || [];
}

// ===== 同期ロジック =====

async function syncSlackToCandidates(dryRun: boolean = false) {
  const supabase = createClient();

  // 最後に同期したslack_tsを取得（admin_notesにJSONで保存）
  const { data: lastSync } = await supabase
    .from("candidates")
    .select("admin_notes")
    .eq("source", "pit_career")
    .like("admin_notes", "%slack_ts%")
    .order("created_at", { ascending: false })
    .limit(1);

  let oldestTs: string | undefined;
  if (lastSync && lastSync[0]?.admin_notes) {
    try {
      const parsed = JSON.parse(lastSync[0].admin_notes);
      if (parsed.slack_ts) {
        // 次回はその次から取得（小数を加算）
        oldestTs = (parseFloat(parsed.slack_ts) + 0.000001).toString();
      }
    } catch {
      // パース失敗時は全件取得
    }
  }

  // Slackメッセージを取得
  const messages = await fetchSlackMessages(oldestTs);
  console.log(`[Slack Sync] ${messages.length}件のメッセージを取得`);

  // パース可能なメッセージのみ抽出
  const parsedCandidates: ParsedCandidate[] = [];
  for (const msg of messages) {
    if (!msg.text) continue;
    const parsed = parseSlackMessage(msg.text, msg.ts);
    if (parsed) {
      parsedCandidates.push(parsed);
    }
  }

  console.log(`[Slack Sync] ${parsedCandidates.length}件パース成功`);

  // 既存の電話番号・メールアドレスで重複チェック
  const phones = parsedCandidates.map((c) => c.phone).filter(Boolean) as string[];
  const emails = parsedCandidates.map((c) => c.email).filter(Boolean) as string[];

  const { data: existing } = await supabase
    .from("candidates")
    .select("phone, email")
    .or(
      [
        phones.length > 0 ? `phone.in.(${phones.join(",")})` : "",
        emails.length > 0 ? `email.in.(${emails.join(",")})` : "",
      ]
        .filter(Boolean)
        .join(",")
    );

  const existingPhones = new Set((existing || []).map((c: any) => c.phone).filter(Boolean));
  const existingEmails = new Set((existing || []).map((c: any) => c.email).filter(Boolean));

  // 新規のみ抽出
  const newCandidates = parsedCandidates.filter(
    (c) =>
      (!c.phone || !existingPhones.has(c.phone)) &&
      (!c.email || !existingEmails.has(c.email))
  );

  console.log(`[Slack Sync] 新規候補者: ${newCandidates.length}件`);

  if (dryRun) {
    return {
      total_messages: messages.length,
      parsed: parsedCandidates.length,
      already_exists: parsedCandidates.length - newCandidates.length,
      new_candidates: newCandidates.length,
      preview: newCandidates.slice(0, 10),
    };
  }

  // データベースに挿入
  const results = {
    created: 0,
    errors: 0,
    details: [] as Array<{ name: string; status: string }>,
  };

  for (const candidate of newCandidates) {
    try {
      // Slack投稿時刻を登録日時に変換
      const slackEpoch = parseFloat(candidate.slack_ts) * 1000;
      const slackDate = new Date(slackEpoch);
      const application_date = isNaN(slackEpoch)
        ? null
        : `${slackDate.getFullYear()}-${String(slackDate.getMonth() + 1).padStart(2, "0")}-${String(slackDate.getDate()).padStart(2, "0")}`;
      const application_time = isNaN(slackEpoch)
        ? null
        : `${String(slackDate.getHours()).padStart(2, "0")}:${String(slackDate.getMinutes()).padStart(2, "0")}:${String(slackDate.getSeconds()).padStart(2, "0")}`;

      const insertData: Record<string, unknown> = {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        birth_date: estimateBirthDate(candidate.age),
        status: "new",
        source: "pit_career",
        form_type: "pit_career_flow",
        contact_status: "pending",
        portal_active: false,
        line_registered: false,
        interview_type: "online",
        nationality: candidate.nationality,
        prefecture: candidate.prefecture,
        application_date,
        application_time,
        interview_date: candidate.interview_date,
        interview_url: candidate.interview_url,
        admin_notes: JSON.stringify({
          slack_ts: candidate.slack_ts,
          interview_time: candidate.interview_time,
          transfer_timing: candidate.transfer_timing,
          work_restrictions: candidate.work_restrictions,
          age: candidate.age,
        }),
      };

      const { error } = await supabase.from("candidates").insert(insertData);

      if (error) {
        console.warn(`[Slack Sync] 挿入エラー (${candidate.name}):`, error.message);
        results.errors++;
        results.details.push({ name: candidate.name, status: `error: ${error.message}` });
      } else {
        results.created++;
        results.details.push({ name: candidate.name, status: "created" });
      }
    } catch (err: any) {
      results.errors++;
      results.details.push({ name: candidate.name, status: `error: ${err.message}` });
    }
  }

  return {
    total_messages: messages.length,
    parsed: parsedCandidates.length,
    already_exists: parsedCandidates.length - newCandidates.length,
    created: results.created,
    errors: results.errors,
    details: results.details,
  };
}

// ===== API Handlers =====

// GET: Vercel Cronから30分ごとに呼び出される
export async function GET(request: NextRequest) {
  // Cron Secret認証（Vercel Cronから呼ばれた場合のみ実行）
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // 手動GETの場合はステータスのみ返す
    const { searchParams } = new URL(request.url);
    if (searchParams.get("status") === "1") {
      return NextResponse.json({
        success: true,
        message: "Slack sync endpoint is active",
        channel: SLACK_CHANNEL_ID,
      });
    }
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncSlackToCandidates(false);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[Slack Sync] エラー:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: 手動同期（管理画面から）
export async function POST(request: NextRequest) {
  try {
    let options: { dry_run?: boolean } = {};
    try {
      options = await request.json();
    } catch {
      // bodyなしでもOK
    }

    const result = await syncSlackToCandidates(options.dry_run || false);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[Slack Sync] エラー:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
