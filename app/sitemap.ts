import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 3600; // rebuild at most once an hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/kjop-og-selg`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/lei`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tjenester`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/jobber`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/kart`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/om-oss`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/personvern`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/vilkar`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return staticPages;

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const [listings, rentals] = await Promise.all([
      supabase.from("listings").select("id, created_at").eq("status", "active").limit(5000),
      supabase.from("rentals").select("id, created_at").eq("status", "active").limit(5000),
    ]);

    const ads: MetadataRoute.Sitemap = [
      ...(listings.data ?? []).map((r) => ({
        url: `${SITE_URL}/kjop-og-selg/${r.id}`,
        lastModified: new Date(r.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...(rentals.data ?? []).map((r) => ({
        url: `${SITE_URL}/lei/${r.id}`,
        lastModified: new Date(r.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
    return [...staticPages, ...ads];
  } catch {
    return staticPages;
  }
}
