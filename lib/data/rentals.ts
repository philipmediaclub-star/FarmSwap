import { createClient } from "@/lib/supabase/client";
import { rentalListings, type RentalListing } from "@/data/rentals";

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
      return { rentals: rentalListings, isLive: false };
    }

    const mapped: RentalListing[] = data.map((row) => ({
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
    }));

    return { rentals: mapped, isLive: true };
  } catch {
    return { rentals: rentalListings, isLive: false };
  }
}
