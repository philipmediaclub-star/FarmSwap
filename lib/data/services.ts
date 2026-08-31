import { createClient } from "@/lib/supabase/client";
import { serviceListings, type ServiceListing } from "@/data/services";

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
      return { services: serviceListings, isLive: false };
    }

    const mapped: ServiceListing[] = data.map((row) => ({
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
    return { services: serviceListings, isLive: false };
  }
}
