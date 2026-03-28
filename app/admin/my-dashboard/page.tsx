import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MyDashboardClient from "./MyDashboardClient";

const PIPELINE_STAGES = [
  { key: "new", label: "新規登録", color: "#3B82F6" },
  { key: "interview_scheduling", label: "面談調整中", color: "#0EA5E9" },
  { key: "interviewed", label: "面談済み", color: "#8B5CF6" },
  { key: "job_proposed", label: "求人提案中", color: "#EAB308" },
  { key: "applying", label: "応募中", color: "#F97316" },
  { key: "in_selection", label: "選考中", color: "#F59E0B" },
  { key: "offered", label: "内定", color: "#10B981" },
  { key: "placed", label: "入社", color: "#059669" },
] as const;

function computeKpiAndAlert(
  candidates: {
    id: string;
    status: string;
    updated_at: string;
    created_at: string;
  }[]
) {
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  ).toISOString();

  const thisMonthCandidates = candidates.filter(
    (c) => c.created_at >= monthStart && c.created_at <= monthEnd
  );

  const myKpi = {
    total: candidates.length,
    thisMonth: thisMonthCandidates.length,
    active: candidates.filter(
      (c) => !["placed", "failed", "closed"].includes(c.status)
    ).length,
    placed: candidates.filter((c) => c.status === "placed").length,
    offered: candidates.filter((c) => c.status === "offered").length,
  };

  const threeDaysAgo = new Date(
    now.getTime() - 3 * 24 * 60 * 60 * 1000
  ).toISOString();
  const alertCount = candidates.filter(
    (c) =>
      !["placed", "failed", "closed"].includes(c.status) &&
      c.updated_at < threeDaysAgo
  ).length;

  return { myKpi, alertCount };
}

export default async function MyDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("users")
    .select("id, name, role")
    .eq("id", user.id)
    .single();

  if (!me) redirect("/admin/dashboard");

  // Fetch all CA users for tab selection
  const { data: caUsers } = await supabase
    .from("users")
    .select("id, name")
    .order("name", { ascending: true });

  const caList = (caUsers || []).map((u: { id: string; name: string }) => ({
    id: u.id,
    name: u.name,
  }));

  // Fetch all candidates (not deleted) with their ca_id
  const { data: allCandidates } = await supabase
    .from("candidates")
    .select(
      "id, name, email, phone, status, current_company, current_salary, desired_salary, updated_at, created_at, ca_id"
    )
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  const candidates = allCandidates || [];

  // Group candidates by CA and compute KPIs
  const allCaData: Record<
    string,
    {
      candidates: typeof candidates;
      myKpi: {
        total: number;
        thisMonth: number;
        active: number;
        placed: number;
        offered: number;
      };
      alertCount: number;
    }
  > = {};

  for (const ca of caList) {
    const caCandidates = candidates.filter(
      (c: { ca_id: string | null }) => c.ca_id === ca.id
    );
    const { myKpi, alertCount } = computeKpiAndAlert(caCandidates);
    allCaData[ca.id] = { candidates: caCandidates, myKpi, alertCount };
  }

  return (
    <MyDashboardClient
      currentCaId={me.id}
      caList={caList}
      allCaData={allCaData as any}
      stages={PIPELINE_STAGES.map((s) => ({ ...s }))}
    />
  );
}
