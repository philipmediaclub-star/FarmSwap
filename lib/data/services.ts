import { createClient } from "@/lib/supabase/client";
import { isPromotedNow, promotedFirst } from "@/lib/promo";
import { type ServiceListing } from "@/data/services";

export async function fetchServices(): Promise<{
  services: ServiceListing[];
  isLive: boolean;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*, profiles(full_name)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return { services: [], isLive: false };
    }

    const mapped: ServiceListing[] = promotedFirst(data).map((row) => ({
      promoted: isPromotedNow(row.promoted_from, row.promoted_until),
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      category: row.category,
      priceType: row.price_type,
      price: row.price !== null ? Number(row.price) : null,
      location: row.location,
      availability: row.availability ?? "",
      providerName: row.profiles?.full_name ?? "Ukjent bruker",
      providerId: row.provider_id,
    }));

    return { services: mapped, isLive: true };
  } catch {
    return { services: [], isLive: false };
  }
}
