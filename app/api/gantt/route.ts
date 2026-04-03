import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  new: "#3B82F6",
  interview_scheduling: "#0EA5E9",
  interviewed: "#8B5CF6",
  job_proposed: "#EAB308",
  applying: "#F97316",
  in_selection: "#F59E0B",
  offered: "#10B981",
  placed: "#059669",
  failed: "#EF4444",
  closed: "#6B7280",
};

// Status labels (Japanese)
const STATUS_LABELS: Record<string, string> = {
  new: "新規登録",
  interview_scheduling: "面談調整中",
  interviewed: "面談済み",
  job_proposed: "求人提案中",
  applying: "応募中",
  in_selection: "選考中",
  offered: "内定",
  placed: "入社",
  failed: "不合格",
  closed: "対応終了",
};

interface StatusRecord {
  status: string;
  started_at: string;
  ended_at: string | null;
}

interface CandidateData {
  id: string;
  name: string;
  ca_name: string;
  timeline: Array<{
    status: string;
    label: string;
    color: string;
    start: string;
    end: string;
  }>;
}

interface CaOption {
  id: string;
  name: string;
}

function getDateRange(): { from: string; to: string } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  from.setMonth(from.getMonth() - 3);
  from.setHours(0, 0, 0, 0);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const caId = searchParams.get("ca_id");

    const { from, to } = getDateRange();

    // Query status_history with candidates and users (CA) information
    let query = supabase
      .from("status_history")
      .select(
        `
        id,
        candidate_id,
        status,
        started_at,
        ended_at,
        candidates!inner (
          id,
          name,
          ca_id,
          users!candidates_ca_id_fkey (
            id,
            name
          )
        )
      `
      )
      .gte("started_at", from)
      .lte("started_at", to)
      .order("candidate_id")
      .order("started_at", { referencedTable: "status_history", ascending: true });

    if (caId) {
      query = query.eq("candidates.ca_id", caId);
    }

    const { data: statusHistoryData, error: statusError } = await query;

    if (statusError) {
      return NextResponse.json(
        { success: false, error: statusError.message },
        { status: 500 }
      );
    }

    // Fetch all CAs for dropdown
    const { data: casData, error: casError } = await supabase
      .from("users")
      .select("id, name")
      .eq("role", "ca")
      .order("name");

    if (casError) {
      return NextResponse.json(
        { success: false, error: casError.message },
        { status: 500 }
      );
    }

    // Group status history by candidate
    type CandidateMap = Record<
      string,
      {
        id: string;
        name: string;
        ca_id: string;
        ca_name: string;
        statuses: StatusRecord[];
      }
    >;

    const candidateMap: CandidateMap = {};

    (statusHistoryData || []).forEach((record: any) => {
      const candidateId = record.candidate_id;
      const candidate = record.candidates;
      const ca = candidate.users;

      if (!candidateMap[candidateId]) {
        candidateMap[candidateId] = {
          id: candidate.id,
          name: candidate.name,
          ca_id: candidate.ca_id,
          ca_name: ca?.name || "未割り当て",
          statuses: [],
        };
      }

      candidateMap[candidateId].statuses.push({
        status: record.status,
        started_at: record.started_at,
        ended_at: record.ended_at,
      });
    });

    // Transform to response format
    const candidates: CandidateData[] = Object.values(candidateMap)
      .map((candidate) => {
        const timeline = candidate.statuses.map((status) => ({
          status: status.status,
          label: STATUS_LABELS[status.status] || status.status,
          color: STATUS_COLORS[status.status] || "#9CA3AF",
          start: status.started_at,
          end: status.ended_at || new Date().toISOString(),
        }));

        return {
          id: candidate.id,
          name: candidate.name,
          ca_name: candidate.ca_name,
          timeline,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const cas: CaOption[] = (casData || []).map((ca: any) => ({
      id: ca.id,
      name: ca.name,
    }));

    return NextResponse.json({
      success: true,
      data: {
        candidates,
        cas,
        date_range: { start: from, end: to },
      },
    });
  } catch (error) {
    console.error("Gantt chart error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
