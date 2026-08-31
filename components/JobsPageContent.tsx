"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { fetchJobs } from "@/lib/data/jobs";
import type { JobListing } from "@/data/jobs";
import JobCard from "./JobCard";

export default function JobsPageContent() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs().then(({ jobs, isLive }) => {
      setJobs(jobs);
      setIsLive(isLive);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
          {t("jobs_page_title")}
        </h1>
        {!loading && !isLive && (
          <span className="text-xs font-tag uppercase tracking-wide text-steel border border-steel-light rounded-full px-2.5 py-1">
            {t("demo_data_badge")}
          </span>
        )}
      </div>
      <p className="mt-2 text-ink/65">{t("jobs_page_subtitle")}</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
