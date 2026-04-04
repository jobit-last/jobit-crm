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
  new: "æ°è¦ç»é²",
  interview_scheduling: "é¢è«èª¿æ´ä¸­",
  interviewed: "é¢è«æ¸ã¿",
  job_proposed: "æ±äººææ¡ä¸­",
  applying: "å¿åä¸­",
  in_selection: "é¸èä¸­",
  offered: "åå®",
  placed: "å¥ç¤¾",
  failed: "ä¸åæ ¼",
  closed: "å¯¾å¿çµäº",
};

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

    const cas: CaOption[] = (casData || []).map((ca: any) => ({
      id: ca.id,
      name: ca.name,
    }));

    // Try to get timeline data from candidate_status_histories table
    let candidates: CandidateData[] = [];

    try {
      // Query candidate_status_histories with candidate info
      let historyQuery = supabase
        .from("candidate_status_histories")
        .select(
          `
          id,
          candidate_id,
          from_status,
          to_status,
          changed_at,
          changed_by,
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
        .gte("changed_at", from)
        .lte("changed_at", to)
        .order("changed_at", { ascending: true });

      if (caId) {
        historyQuery = historyQuery.eq("candidates.ca_id", caId);
      }

      const { data: historyData, error: historyError } = await historyQuery;

      if (!historyError && historyData && historyData.length > 0) {
        // Group by candidate and build timeline from status transitions
        type CandidateMap = Record<
          string,
          {
            id: string;
            name: string;
            ca_name: string;
            transitions: Array<{
              to_status: string;
              changed_at: string;
            }>;
          }
        >;

        const candidateMap: CandidateMap = {};

        historyData.forEach((record: any) => {
          const candidateId = record.candidate_id;
          const candidate = record.candidates;
          const ca = candidate?.users;

          if (!candidateMap[candidateId]) {
            candidateMap[candidateId] = {
              id: candidate?.id || candidateId,
              name: candidate?.name || "ä¸æ",
              ca_name: ca?.name || "æªå²ãå½ã¦",
              transitions: [],
            };
          }

          candidateMap[candidateId].transitions.push({
            to_status: record.to_status,
            changed_at: record.changed_at,
          });
        });

        // Convert transitions to timeline segments
        candidates = Object.values(candidateMap)
          .map((candidate) => {
            const timeline = candidate.transitions.map((t, idx) => {
              const nextTransition = candidate.transitions[idx + 1];
              return {
                status: t.to_status,
                label: STATUS_LABELS[t.to_status] || t.to_status,
                color: STATUS_COLORS[t.to_status] || "#9CA3AF",
                start: t.changed_at,
                end: nextTransition ? nextTransition.changed_at : new Date().toISOString(),
              };
            });

            return {
              id: candidate.id,
              name: candidate.name,
              ca_name: candidate.ca_name,
              timeline,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
      } else {
        // Fallback: build basic timeline from candidates table using created_at and current status
        let candidatesQuery = supabase
          .from("candidates")
          .select("id, name, status, created_at, ca_id, ca:users!ca_id(id, name)")
          .eq("is_deleted", false)
          .gte("created_at", from)
          .lte("created_at", to);

        if (caId) {
          candidatesQuery = candidatesQuery.eq("ca_id", caId);
        }

        const { data: candidatesData, error: candidatesError } = await candidatesQuery;

        if (!candidatesError && candidatesData) {
          candidates = candidatesData
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              ca_name: (c.ca as { name?: string } | null)?.name || "æªå²ãå½ã¦",
              timeline: [
                {
                  status: c.status,
                  label: STATUS_LABELS[c.status] || c.status,
                  color: STATUS_COLORS[c.status] || "#9CA3AF",
                  start: c.created_at,
                  end: new Date().toISOString(),
                },
              ],
            }))
            .sort((a: CandidateData, b: CandidateData) => a.name.localeCompare(b.name));
        }
      }
    } catch (e) {
      // Table might not exist - use fallback from candidates table
      console.warn("Status history not available, using fallback:", e);

      let candidatesQuery = supabase
        .from("candidates")
        .select("id, name, status, created_at, ca_id, ca:users!ca_id(id, name)")
        .eq("is_deleted", false)
        .gte("created_at", from)
        .lte("created_at", to);

      if (caId) {
        candidatesQuery = candidatesQuery.eq("ca_id", caId);
      }

      const { data: candidatesData, error: candidatesError } = await candidatesQuery;

      if (!candidatesError && candidatesData) {
        candidates = candidatesData
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            ca_name: (c.ca as { name?: string } | null)?.name || "æªå²ãå½ã¦",
            timeline: [
              {
                status: c.status,
                label: STATUS_LABELS[c.status] || c.status,
                color: STATUS_COLORS[c.status] || "#9CA3AF",
                start: c.created_at,
                end: new Date().toISOString(),
              },
            ],
          }))
          .sort((a: CandidateData, b: CandidateData) => a.name.localeCompare(b.name));
      }
    }

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
