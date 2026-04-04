import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/knowledge/prediction?candidate_id=xxx&company_id=yyy
 * 内定確度予測 — 過去の選考結果ナレッジから内定確率を推定
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidate_id");
    const companyId = searchParams.get("company_id");

    // 選考結果カテゴリのナレッジを取得
    let query = supabase
      .from("knowledge")
      .select("id, title, selection_result, result_reason, candidate:candidates(id, name), company:companies(id, name, industry)")
      .eq("category", "選考結果")
      .not("selection_result", "is", null);

    // 企業が指定されている場合はその企業の選考結果を優先
    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data: results, error } = await query.order("created_at", { ascending: false }).limit(100);

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message },
        { status: 500 }
      );
    }

    const records = results || [];

    if (records.length === 0) {
      // 企業フィルタなしで全体統計を取得
      const { data: allResults, error: allError } = await supabase
        .from("knowledge")
        .select("selection_result")
        .eq("category", "選考結果")
        .not("selection_result", "is", null)
        .limit(500);

      if (allError || !allResults || allResults.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            probability: null,
            confidence: "low",
            total_records: 0,
            breakdown: { offered: 0, rejected: 0, declined: 0, withdrawn: 0 },
            factors: [],
            message: "選考結果データがまだありません。データが蓄積されると予測精度が向上します。",
          },
          message: "",
        });
      }

      // 全体の統計
      const breakdown = {
        offered: allResults.filter((r) => r.selection_result === "offered").length,
        rejected: allResults.filter((r) => r.selection_result === "rejected").length,
        declined: allResults.filter((r) => r.selection_result === "declined").length,
        withdrawn: allResults.filter((r) => r.selection_result === "withdrawn").length,
      };
      const total = allResults.length;
      const probability = total > 0 ? Math.round((breakdown.offered / total) * 100) : 0;

      return NextResponse.json({
        success: true,
        data: {
          probability,
          confidence: total >= 20 ? "high" : total >= 5 ? "medium" : "low",
          total_records: total,
          breakdown,
          factors: [],
          message: companyId
            ? "指定企業の選考結果がないため、全体平均の確徇を表示しています。"
            : "全体の選考結果データに基づく内定確率です。",
        },
        message: "",
      });
    }

    // 結果の内訳
    const breakdown = {
      offered: records.filter((r) => r.selection_result === "offered").length,
      rejected: records.filter((r) => r.selection_result === "rejected").length,
      declined: records.filter((r) => r.selection_result === "declined").length,
      withdrawn: records.filter((r) => r.selection_result === "withdrawn").length,
    };
    const total = records.length;
    const probability = total > 0 ? Math.round((breakdown.offered / total) * 100) : 0;

    // 不合格理由の頻出要因を抽出
    const rejectionReasons = records
      .filter((r) => r.selection_result === "rejected" && r.result_reason)
      .map((r) => r.result_reason as string);

    // 簡易的なキーワード頻度分析
    const keywordCounts: Record<string, number> = {};
    rejectionReasons.forEach((reason) => {
      // 主な理由キーワードを抽出
      const keywords = ["経験不足", "スキル不足", "年齢", "給上", "文化適合", "コミュニケーション", "転職回数", "応望動機", "適性"];
      keywords.forEach((kw) => {
        if (reason.includes(kw)) {
          keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
        }
      });
    });

    const factors = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({
        keyword,
        count,
        percentage: Math.round((count / rejectionReasons.length) * 100),
      }));

    return NextResponse.json({
      success: true,
      data: {
        probability,
        confidence: total >= 20 ? "high" : total >= 5 ? "medium" : "low",
        total_records: total,
        breakdown,
        factors,
        message: companyId
          ? `指定企業の過去${total}件の選考結果に基づく内定確率です。`
          : `過去${total}件の選考結果に基づく内定確率です。`,
      },
      message: "",
    });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
