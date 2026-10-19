import { createClient } from "@/lib/supabase/client";
import { isPromotedNow, promotedFirst } from "@/lib/promo";
import { type JobListing } from "@/data/jobs";

export async function fetchJobs(): Promise<{ jobs: JobListing[]; isLive: boolean }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*, profiles(full_name)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return { jobs: [], isLive: false };
    }

    const mapped: JobListing[] = promotedFirst(data).map((row) => ({
      promoted: isPromotedNow(row.promoted_from, row.promoted_until),
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      location: row.location,
      jobDate: row.job_date,
      duration: row.duration ?? "",
      payment: row.payment ?? "",
      posterName: row.profiles?.full_name ?? "Ukjent bruker",
      posterId: row.poster_id,
      kind: row.kind === "seeking" ? "seeking" : "offer",
      skills: row.skills ?? "",
    }));

    return { jobs: mapped, isLive: true };
  } catch {
    return { jobs: [], isLive: false };
  }
}
