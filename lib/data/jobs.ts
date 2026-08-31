import { createClient } from "@/lib/supabase/client";
import { jobListings, type JobListing } from "@/data/jobs";

export async function fetchJobs(): Promise<{ jobs: JobListing[]; isLive: boolean }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*, profiles(full_name)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return { jobs: jobListings, isLive: false };
    }

    const mapped: JobListing[] = data.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      location: row.location,
      jobDate: row.job_date,
      duration: row.duration ?? "",
      payment: row.payment ?? "",
      posterName: row.profiles?.full_name ?? "Ukjent bruker",
      posterId: row.poster_id,
    }));

    return { jobs: mapped, isLive: true };
  } catch {
    return { jobs: jobListings, isLive: false };
  }
}
