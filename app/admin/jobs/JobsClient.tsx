"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import JobsSearch from "./JobsSearch";
import JobsTable from "./JobsTable";
import JobsPagination from "./JobsPagination";
import type { Job } from "@/types/job";

interface JobsClientProps {
  initialJobs: Job[];
  total: number;
  page: number;
  perPage: number;
}

export default function JobsClient({ initialJobs, total, page, perPage }: JobsClientProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const handlePublishToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !current }),
    });
    if (res.ok) {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_published: !current } : j))
      );
      router.refresh();
    }
  };

  return (
    <>
      <Suspense fallback={<div className="text-gray-500">読み込み中...</div>}>
        <JobsSearch />
      </Suspense>

      <JobsTable jobs={jobs} onPublishToggle={handlePublishToggle} />

      <JobsPagination
        total={total}
        page={page}
        perPage={perPage}
        totalPages={Math.ceil(total / perPage)}
      />
    </>
  );
}
