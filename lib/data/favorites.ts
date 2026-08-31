import { createClient } from "@/lib/supabase/client";

export type FavoriteItem = {
  type: "listing" | "rental" | "service" | "job";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export async function fetchFavorites(userId: string): Promise<FavoriteItem[]> {
  const supabase = createClient();

  const { data: favRows } = await supabase
    .from("favorites")
    .select("listing_type, listing_id")
    .eq("user_id", userId);

  if (!favRows || favRows.length === 0) return [];

  const idsByType: Record<string, string[]> = {};
  for (const row of favRows) {
    idsByType[row.listing_type] = [...(idsByType[row.listing_type] ?? []), row.listing_id];
  }

  const results: FavoriteItem[] = [];

  if (idsByType.listing?.length) {
    const { data } = await supabase.from("listings").select("*").in("id", idsByType.listing);
    for (const l of data ?? []) {
      results.push({
        type: "listing",
        id: l.id,
        title: l.title,
        subtitle: formatNOK(Number(l.price)),
        href: `/kjop-og-selg/${l.id}`,
      });
    }
  }

  if (idsByType.rental?.length) {
    const { data } = await supabase.from("rentals").select("*").in("id", idsByType.rental);
    for (const r of data ?? []) {
      results.push({
        type: "rental",
        id: r.id,
        title: r.title,
        subtitle: `${formatNOK(Number(r.daily_price))}/dag`,
        href: `/lei/${r.id}`,
      });
    }
  }

  if (idsByType.service?.length) {
    const { data } = await supabase.from("services").select("*").in("id", idsByType.service);
    for (const s of data ?? []) {
      results.push({
        type: "service",
        id: s.id,
        title: s.title,
        subtitle: s.location,
        href: `/tjenester`,
      });
    }
  }

  if (idsByType.job?.length) {
    const { data } = await supabase.from("jobs").select("*").in("id", idsByType.job);
    for (const j of data ?? []) {
      results.push({
        type: "job",
        id: j.id,
        title: j.title,
        subtitle: j.location,
        href: `/jobber`,
      });
    }
  }

  return results;
}
