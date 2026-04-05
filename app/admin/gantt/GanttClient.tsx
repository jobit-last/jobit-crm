"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface Timeline {
  status: string;
  label: string;
  color: string;
  start: string;
  end: string;
}

interface Candidate {
  id: string;
  name: string;
  ca_name: string;
  timeline: Timeline[];
}

interface Ca {
  id: string;
  name: string;
}

interface GanttData {
  success: boolean;
  data: {
    candidates: Candidate[];
    cas: Ca[];
    date_range: {
      start: string;
      end: string;
    };
  };
}

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

export default function GanttClient() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [cas, setCas] = useState<Ca[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [selectedCaId, setSelectedCaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const fetchData = useCallback(async (caId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/gantt", window.location.origin);
      if (caId) {
        url.searchParams.append("ca_id", caId);
      }

      const res = await fetch(url.toString());
      const data: GanttData = await res.json();

      if (data.success) {
        setCandidates(data.data.candidates);
        setCas(data.data.cas);
        setDateRange(data.data.date_range);
      } else {
        setError("ãã¼ã¿åå¾ã«å¤±æãã¾ãã");
      }
    } catch (err) {
      setError("ã¨ã©ã¼ãçºçãã¾ãã");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedCaId);
  }, [selectedCaId, fetchData]);

  // Calculate date range and generate date labels
  const dateInfo = useMemo(() => {
    if (!dateRange) return { labels: [], days: 0, weeks: [] };

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const labels: Array<{ date: string; dayOfWeek: string; isMonday: boolean }> = [];
    const weeks: Array<{ startDay: number; label: string }> = [];
    let currentWeekStart = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.toLocaleDateString("ja-JP", { weekday: "short" });
      const dateStr = date.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" });
      const isMonday = date.getDay() === 1;

      if (isMonday && i > 0) {
        weeks.push({
          startDay: currentWeekStart,
          label: dateStr,
        });
        currentWeekStart = i;
      }

      labels.push({ date: dateStr, dayOfWeek, isMonday });
    }

    return { labels, days, weeks };
  }, [dateRange]);

  // Calculate position and width for timeline segments
  const getSegmentStyle = (segment: Timeline) => {
    if (!dateRange) return {};

    const start = new Date(dateRange.start);
    const segmentStart = new Date(segment.start);
    const segmentEnd = new Date(segment.end);
    const totalDays = Math.ceil(
      (new Date(dateRange.end).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const dayOffset = Math.max(
      0,
      Math.ceil((segmentStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    const duration = Math.max(
      1,
      Math.ceil((segmentEnd.getTime() - segmentStart.getTime()) / (1000 * 60 * 60 * 24))
    );

    const leftPercent = (dayOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor: segment.color,
    };
  };

  const filteredCandidates = useMemo(() => {
    if (!selectedCaId) return candidates;
    return candidates.filter((c) => {
      // Find the CA with selectedCaId to get its name
      const ca = cas.find((ca) => ca.id === selectedCaId);
      return ca && c.ca_name === ca.name;
    });
  }, [candidates, selectedCaId, cas]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002D37]"></div>
          </div>
          <p className="mt-4 text-gray-600">èª­ã¿è¾¼ã¿ä¸­...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => fetchData(selectedCaId)}
            className="mt-4 px-4 py-2 bg-[#002D37] text-white rounded-lg hover:bg-opacity-90 transition"
          >
            åèª­ã¿è¾¼ã¿
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002D37]">ã¬ã³ããã£ã¼ã</h1>
          <p className="text-sm text-gray-500 mt-1">æ±è·èã®ã¹ãã¼ã¿ã¹æ¨ç§»ãæç³»åã§è¡¨ç¤º</p>
        </div>

        {/* CA Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="ca-filter" className="text-sm font-medium text-gray-700">
            å¶æ¥­æå½è:
          </label>
          <select
            id="ca-filter"
            value={selectedCaId || ""}
            onChange={(e) => setSelectedCaId(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#002D37] focus:border-transparent"
          >
            <option value="">å¨ä½</option>
            {cas.map((ca) => (
              <option key={ca.id} value={ca.id}>
                {ca.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">ãã¼ã¿ãããã¾ãã</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3">ã¹ãã¼ã¿ã¹å¡ä¾</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[status] || "#9CA3AF" }}
                  ></div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Header with dates */}
                <thead>
                  <tr className="border-b border-gray-200">
                    {/* Candidate names column */}
                    <th className="sticky left-0 z-20 bg-gray-50 border-r border-gray-200 w-40 p-3 text-left">
                      <span className="text-xs font-semibold text-gray-700">æ±è·èå</span>
                    </th>

                    {/* Timeline header */}
                    <th className="bg-gray-50 p-0" style={{ width: "100%" }}>
                      <div className="relative h-20 border-b border-gray-200 flex">
                        <div className="flex-1 flex">
                          {dateInfo.labels.map((dateLabel, idx) => (
                            <div
                              key={idx}
                              className="flex-1 min-w-[40px] border-r border-gray-100 p-1 text-center text-[10px]"
                              style={{
                                backgroundColor: dateLabel.isMonday ? "#F9FAFB" : "transparent",
                              }}
                            >
                              <div className="font-semibold text-gray-800">{dateLabel.date}</div>
                              <div className="text-gray-500 text-[9px]">{dateLabel.dayOfWeek}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* Candidate rows */}
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      {/* Candidate name */}
                      <td className="sticky left-0 z-10 bg-white border-r border-gray-200 w-40 p-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 truncate">{candidate.name}</span>
                          <span className="text-xs text-gray-500 truncate">{candidate.ca_name}</span>
                        </div>
                      </td>

                      {/* Timeline segments */}
                      <td className="p-0 h-9 relative" style={{ width: "100%" }}>
                        <div className="relative h-full">
                          {candidate.timeline.map((segment, segIdx) => {
                            const segmentId = `${candidate.id}-${segIdx}`;
                            const isHovered = hoveredSegment === segmentId;

                            return (
                              <div
                                key={segIdx}
                                className="absolute top-1.5 h-6 rounded px-2 py-1 text-[10px] font-medium text-white flex items-center justify-center transition-all duration-200 cursor-help"
                                style={{
                                  ...getSegmentStyle(segment),
                                  opacity: isHovered ? 1 : 0.75,
                                  boxShadow: isHovered ? "0 2px 8px rgba(0,45,55,0.2)" : "none",
                                  zIndex: isHovered ? 10 : 1,
                                }}
                                onMouseEnter={() => setHoveredSegment(segmentId)}
                                onMouseLeave={() => setHoveredSegment(null)}
                                title={`${STATUS_LABELS[segment.status] || segment.label}\n${new Date(segment.start).toLocaleDateString("ja-JP")} - ${new Date(segment.end).toLocaleDateString("ja-JP")}`}
                              >
                                {/* Tooltip */}
                                {isHovered && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                                    <div className="font-semibold">{STATUS_LABELS[segment.status] || segment.label}</div>
                                    <div className="text-gray-300">
                                      {new Date(segment.start).toLocaleDateString("ja-JP")} ~{" "}
                                      {new Date(segment.end).toLocaleDateString("ja-JP")}
                                    </div>
                                    <div
                                      className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"
                                      style={{ marginTop: "-2px" }}
                                    ></div>
                                  </div>
                                )}

                                <span className="truncate">{STATUS_LABELS[segment.status] || segment.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info text */}
          <div className="text-xs text-gray-500 text-center">
            {filteredCandidates.length}ä»¶ã®æ±è·èãè¡¨ç¤º | éå»3ã¶æéã®ã¹ãã¼ã¿ã¹æ¨ç§»
          </div>
        </>
      )}
    </div>
  );
}
