import { createClient } from "@/lib/supabase/client";
import { isPromotedNow, promotedFirst } from "@/lib/promo";
import { type RentalListing } from "@/data/rentals";

export async function fetchRentals(): Promise<{
  rentals: RentalListing[];
  isLive: boolean;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rentals")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return { rentals: [], isLive: false };
    }

    const mapped: RentalListing[] = promotedFirst(data).map((row) => ({
      promoted: isPromotedNow(row.promoted_from, row.promoted_until),
      id: row.id,
      title: row.title,
      dailyPrice: Number(row.daily_price),
      weeklyPrice: Number(row.weekly_price ?? row.daily_price * 5),
      category: row.category,
      location: row.location,
      distanceKm: 0,
      owner: "",
      description: row.description ?? "",
      conditions: row.conditions ?? "",
      imageQuery: row.title,
      imageUrls: row.image_urls ?? [],
      unavailableDates: [],
      lat: row.latitude != null ? Number(row.latitude) : undefined,
      lng: row.longitude != null ? Number(row.longitude) : undefined,
    }));

    return { rentals: mapped, isLive: true };
  } catch {
    return { rentals: [], isLive: false };
  }
}
