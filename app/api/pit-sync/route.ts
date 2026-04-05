import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PIT API設定
const PIT_API_BASE = "https://api.manage.pit-job.net/api/v1";

// PIT examination active_tab値
// 1=登録審査判定, 2=面談日程調整, 3=オンライン審査, 4=本登録待ち, 5=本人確認書類確認, 6=?, 7=?
const SYNC_TABS = [1, 2, 3, 4, 5];

// 都道府県の正規化マップ（PIT address → Jobit prefecture）
function extractPrefecture(address: string | null): string | null {
  if (!address) return null;
  const prefectures = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
  ];
  for (const pref of prefectures) {
    if (address.includes(pref)) return pref;
  }
  // 「県」「都」「府」「道」なしの短縮形もチェック
  const shortPrefMap: Record<string, string> = {
    "東京": "東京都", "大阪": "大阪府", "京都": "京都府",
    "北海道": "北海道",
  };
  for (const [short, full] of Object.entries(shortPrefMap)) {
    if (address.startsWith(short)) return full;
  }
  return address; // そのまま返す
}

// PIT APIへのログイン
async function pitLogin(): Promise<string> {
  const email = process.env.PIT_API_EMAIL;
  const password = process.env.PIT_API_PASSWORD;

  if (!email || !password) {
    throw new Error("PIT_API_EMAIL / PIT_API_PASSWORD が環境変数に設定されていません");
  }

  const res = await fetch(`${PIT_API_BASE}/admins/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PIT認証失敗 (${res.status}): ${err}`);
  }

  const data = await res.json();
  // PIT OAuth response: { access_token, refresh_token, ... }
  const token = data.access_token || data.token;
  if (!token) {
    throw new Error("PITログインレスポンスにアクセストークンがありません");
  }
  return token;
}

// PIT examination一覧を取得
async function fetchPitExaminations(token: string, activeTab: number): Promise<any[]> {
  const res = await fetch(`${PIT_API_BASE}/examinations?active_tab=${activeTab}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("PIT_TOKEN_EXPIRED");
    const err = await res.text();
    throw new Error(`PIT examinations取得失敗 (tab=${activeTab}, ${res.status}): ${err}`);
  }

  const data = await res.json();
  // APIレスポンスは配列 or { data: [...] } の可能性
  return Array.isArray(data) ? data : (data.data || data.examinations || []);
}

// PIT ユーザー詳細を取得
async function fetchPitUserDetail(token: string, userId: number): Promise<any> {
  const res = await fetch(`${PIT_API_BASE}/users/detail/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.warn(`PIT user detail取得失敗 (id=${userId}, ${res.status})`);
    return null;
  }

  return await res.json();
}

// PIT user → Jobit candidate へのマッピング
function mapPitUserToCandidate(pitUser: any, pitUserId: number) {
  const name = pitUser.name || pitUser.full_name || `PIT-${pitUserId}`;
  const phone = pitUser.phone_number || pitUser.phone || null;
  const email = pitUser.email || null;
  const birthday = pitUser.birthday || pitUser.birth_date || null;
  const address = pitUser.address || pitUser.prefecture || null;
  // address stored in notes if available

  return {
    name: name.trim(),
    email,
    phone: phone ? phone.replace(/[-\s]/g, "") : null,
    birth_date: birthday || null,
    status: "new",
    source: "pit",
    notes: address ? `住所: ${address}` : null,
    pit_user_id: pitUserId,
    pit_synced_at: new Date().toISOString(),
    is_deleted: false,
  };
}

// ===== API Handlers =====

// GET: 同期状態を確認
export async function GET() {
  try {
    const supabase = await createClient();

    // PIT連携済み候補者数
    const { count: syncedCount } = await supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .not("pit_user_id", "is", null);

    // 最終同期日時
    const { data: lastSynced } = await supabase
      .from("candidates")
      .select("pit_synced_at")
      .not("pit_synced_at", "is", null)
      .order("pit_synced_at", { ascending: false })
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        synced_count: syncedCount || 0,
        last_synced_at: lastSynced?.[0]?.pit_synced_at || null,
      },
    });
  } catch (error: any) {
    console.error("PIT sync status error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: 同期を実行
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // リクエストボディからオプション取得（任意）
    let options: { tabs?: number[]; dry_run?: boolean } = {};
    try {
      options = await request.json();
    } catch {
      // bodyなしでもOK
    }

    const tabs = options.tabs || SYNC_TABS;
    const dryRun = options.dry_run || false;

    // 1. PIT APIにログイン
    console.log("[PIT Sync] ログイン開始...");
    const token = await pitLogin();
    console.log("[PIT Sync] ログイン成功");

    // 2. 各タブからexamination一覧を取得
    const allPitUsers: Map<number, any> = new Map();

    for (const tab of tabs) {
      try {
        const examinations = await fetchPitExaminations(token, tab);
        console.log(`[PIT Sync] Tab ${tab}: ${examinations.length}件取得`);

        for (const exam of examinations) {
          const user = exam.user || exam;
          const userId = user.id || exam.user_id;
          if (userId && !allPitUsers.has(userId)) {
            allPitUsers.set(userId, user);
          }
        }
      } catch (err: any) {
        console.warn(`[PIT Sync] Tab ${tab} 取得エラー:`, err.message);
      }
    }

    console.log(`[PIT Sync] PIT全ユーザー: ${allPitUsers.size}件（重複除去後）`);

    // 3. 既存のpit_user_idを取得（重複チェック用）
    const { data: existingCandidates } = await supabase
      .from("candidates")
      .select("pit_user_id, phone")
      .not("pit_user_id", "is", null);

    const existingPitIds = new Set(
      (existingCandidates || []).map((c: any) => c.pit_user_id)
    );

    // 電話番号でも重複チェック
    const existingPhones = new Set(
      (existingCandidates || [])
        .filter((c: any) => c.phone)
        .map((c: any) => c.phone.replace(/[-\s]/g, ""))
    );

    // 電話番号のみ登録済みの候補者も取得（pit_user_id未設定）
    const { data: phoneCandidates } = await supabase
      .from("candidates")
      .select("phone")
      .is("pit_user_id", null)
      .not("phone", "is", null);

    for (const c of phoneCandidates || []) {
      if (c.phone) existingPhones.add(c.phone.replace(/[-\s]/g, ""));
    }

    // 4. 新規ユーザーをフィルタリング
    const newUsers: Array<{ pitUserId: number; userData: any }> = [];

    for (const [pitUserId, userData] of allPitUsers) {
      // pit_user_idで重複チェック
      if (existingPitIds.has(pitUserId)) continue;

      // 電話番号で重複チェック
      const phone = (userData.phone_number || userData.phone || "").replace(/[-\s]/g, "");
      if (phone && existingPhones.has(phone)) continue;

      newUsers.push({ pitUserId, userData });
    }

    console.log(`[PIT Sync] 新規ユーザー: ${newUsers.length}件`);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dry_run: true,
        data: {
          total_pit_users: allPitUsers.size,
          already_synced: allPitUsers.size - newUsers.length,
          new_users: newUsers.length,
          new_user_preview: newUsers.slice(0, 10).map(({ pitUserId, userData }) => ({
            pit_user_id: pitUserId,
            name: userData.name || userData.full_name,
            phone: userData.phone_number || userData.phone,
          })),
        },
      });
    }

    // 5. 新規ユーザーを取得して詳細情報からcandidate作成
    const results = {
      created: 0,
      errors: 0,
      details: [] as Array<{ pit_user_id: number; name: string; status: string }>,
    };

    for (const { pitUserId, userData } of newUsers) {
      try {
        // 詳細情報を取得（基本情報はexaminationから取れているが、追加情報がある場合）
        let detailedUser = userData;
        try {
          const detail = await fetchPitUserDetail(token, pitUserId);
          if (detail) {
            detailedUser = { ...userData, ...detail };
          }
        } catch {
          // 詳細取得失敗時はexaminationデータのみ使用
        }

        const candidateData = mapPitUserToCandidate(detailedUser, pitUserId);

        const { error: insertError } = await supabase
          .from("candidates")
          .insert(candidateData);

        if (insertError) {
          console.warn(`[PIT Sync] 挿入エラー (PIT ID: ${pitUserId}):`, insertError.message);
          results.errors++;
          results.details.push({
            pit_user_id: pitUserId,
            name: candidateData.name,
            status: `error: ${insertError.message}`,
          });
        } else {
          results.created++;
          results.details.push({
            pit_user_id: pitUserId,
            name: candidateData.name,
            status: "created",
          });
        }
      } catch (err: any) {
        console.warn(`[PIT Sync] ユーザー処理エラー (PIT ID: ${pitUserId}):`, err.message);
        results.errors++;
        results.details.push({
          pit_user_id: pitUserId,
          name: userData.name || `PIT-${pitUserId}`,
          status: `error: ${err.message}`,
        });
      }
    }

    console.log(`[PIT Sync] 完了: ${results.created}件作成, ${results.errors}件エラー`);

    return NextResponse.json({
      success: true,
      data: {
        total_pit_users: allPitUsers.size,
        already_synced: allPitUsers.size - newUsers.length,
        created: results.created,
        errors: results.errors,
        details: results.details,
      },
    });
  } catch (error: any) {
    console.error("[PIT Sync] エラー:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
