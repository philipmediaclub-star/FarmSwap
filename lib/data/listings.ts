import { createClient } from "@/lib/supabase/client";
import { featuredListings, type Listing } from "@/data/listings";

/**
 * Fetches listings from Supabase. Falls back to local demo data if the
 * table is empty or unreachable, so the site never looks broken before
 * real listings have been added.
 */
export async function fetchListings(): Promise<{
  listings: Listing[];
  isLive: boolean;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return { listings: featuredListings, isLive: false };
    }

    const mapped: Listing[] = data.map((row) => ({
      id: row.id,
      title: row.title,
      price: Number(row.price),
      currency: "NOK",
      category: row.category,
      location: row.location,
      distanceKm: 0, // requires the user's own location to compute — added with the Map feature
      year: row.year ?? undefined,
      hours: row.hours ?? undefined,
      condition: row.condition ?? undefined,
      imageQuery: row.title,
      imageUrls: row.image_urls ?? [],
      sellerName: "",
    }));

    return { listings: mapped, isLive: true };
  } catch {
    return { listings: featuredListings, isLive: false };
  }
}
