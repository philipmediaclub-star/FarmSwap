"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fetchFavorites, type FavoriteItem } from "@/lib/data/favorites";
import type { Listing } from "@/data/listings";
import type { RentalListing } from "@/data/rentals";

type ReservationRow = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  message: string | null;
  rentals: { id: string; title: string } | null;
  requester?: { full_name: string } | null;
};

type ItemStatRow = {
  id: string;
  type: "listing" | "rental";
  title: string;
  href: string;
  views: number;
  favorites: number;
  avgRating: number | null;
  ratingCount: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default function DashboardContent() {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const [listings, setListings] = useState<(Listing & { status: string })[]>([]);
  const [rentals, setRentals] = useState<(RentalListing & { status: string })[]>([]);
  const [myRequests, setMyRequests] = useState<ReservationRow[]>([]);
  const [incoming, setIncoming] = useState<ReservationRow[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [itemStats, setItemStats] = useState<ItemStatRow[]>([]);

  async function loadAll(uid: string) {
    const supabase = createClient();

    const [{ data: listingRows }, { data: rentalRows }, { data: myReqRows }, { data: incomingRows }, favs] =
      await Promise.all([
        supabase.from("listings").select("*").eq("seller_id", uid),
        supabase.from("rentals").select("*").eq("owner_id", uid),
        supabase
          .from("reservations")
          .select("*, rentals(id, title)")
          .eq("requester_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("reservations")
          .select("*, rentals!inner(id, title, owner_id), requester:profiles!reservations_requester_id_fkey(full_name)")
          .eq("rentals.owner_id", uid)
          .order("created_at", { ascending: false }),
        fetchFavorites(uid),
      ]);

    setListings(
      (listingRows ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        price: Number(l.price),
        currency: "NOK",
        category: l.category,
        location: l.location,
        distanceKm: 0,
        year: l.year ?? undefined,
        hours: l.hours ?? undefined,
        condition: l.condition ?? undefined,
        imageQuery: l.title,
        imageUrls: l.image_urls ?? [],
        sellerName: "",
        status: l.status as string,
      }))
    );

    setRentals(
      (rentalRows ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        dailyPrice: Number(r.daily_price),
        weeklyPrice: Number(r.weekly_price ?? r.daily_price * 5),
        category: r.category,
        location: r.location,
        distanceKm: 0,
        owner: "",
        description: r.description ?? "",
        conditions: r.conditions ?? "",
        imageQuery: r.title,
        imageUrls: r.image_urls ?? [],
        unavailableDates: [],
        status: r.status as string,
      }))
    );

    setMyRequests((myReqRows as unknown as ReservationRow[]) ?? []);
    setIncoming((incomingRows as unknown as ReservationRow[]) ?? []);
    setFavorites(favs);

    // Per-item stats: views (already in the rows above), favorite counts,
    // and average ratings — fetched in bulk rather than per-card.
    const listingIds = (listingRows ?? []).map((l) => l.id);
    const rentalIds = (rentalRows ?? []).map((r) => r.id);
    const allIds = [...listingIds, ...rentalIds];

    let favCounts: Record<string, number> = {};
    let ratingMap: Record<string, { sum: number; count: number }> = {};

    if (allIds.length > 0) {
      const { data: favRows } = await supabase
        .from("favorites")
        .select("listing_id")
        .in("listing_id", allIds)
        .in("listing_type", ["listing", "rental"]);
      favCounts = (favRows ?? []).reduce((acc: Record<string, number>, row) => {
        acc[row.listing_id] = (acc[row.listing_id] ?? 0) + 1;
        return acc;
      }, {});

      const { data: reviewRows } = await supabase
        .from("listing_reviews")
        .select("listing_id, rating")
        .in("listing_id", allIds)
        .in("listing_type", ["listing", "rental"]);
      ratingMap = (reviewRows ?? []).reduce(
        (acc: Record<string, { sum: number; count: number }>, row) => {
          const cur = acc[row.listing_id] ?? { sum: 0, count: 0 };
          acc[row.listing_id] = { sum: cur.sum + row.rating, count: cur.count + 1 };
          return acc;
        },
        {}
      );
    }

    const stats: ItemStatRow[] = [
      ...(listingRows ?? []).map((l) => ({
        id: l.id,
        type: "listing" as const,
        title: l.title,
        href: `/kjop-og-selg/${l.id}`,
        views: l.view_count ?? 0,
        favorites: favCounts[l.id] ?? 0,
        avgRating: ratingMap[l.id] ? ratingMap[l.id].sum / ratingMap[l.id].count : null,
        ratingCount: ratingMap[l.id]?.count ?? 0,
      })),
      ...(rentalRows ?? []).map((r) => ({
        id: r.id,
        type: "rental" as const,
        title: r.title,
        href: `/lei/${r.id}`,
        views: r.view_count ?? 0,
        favorites: favCounts[r.id] ?? 0,
        avgRating: ratingMap[r.id] ? ratingMap[r.id].sum / ratingMap[r.id].count : null,
        ratingCount: ratingMap[r.id]?.count ?? 0,
      })),
    ];
    setItemStats(stats);

    setLoading(false);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) loadAll(uid);
      else setLoading(false);
    });
  }, []);

  async function updateReservationStatus(id: string, status: "confirmed" | "declined") {
    const supabase = createClient();
    await supabase.from("reservations").update({ status }).eq("id", id);
    setIncoming((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function updateListingStatus(id: string, status: "active" | "sold" | "removed") {
    if (status === "removed" && !confirm("Er du sikker på at du vil fjerne denne annonsen?")) return;
    const supabase = createClient();
    await supabase.from("listings").update({ status }).eq("id", id);
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function updateRentalStatus(id: string, status: "active" | "paused" | "removed") {
    if (status === "removed" && !confirm("Er du sikker på at du vil fjerne denne annonsen?")) return;
    const supabase = createClient();
    await supabase.from("rentals").update({ status }).eq("id", id);
    setRentals((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  if (loading || userId === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-ink/50">…</div>;
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center mx-auto">
          <Lock size={20} className="text-moss-dark" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          {t("post_login_required_title")}
        </h1>
        <Link
          href="/logg-inn"
          className="mt-6 inline-block bg-moss hover:bg-moss-dark text-paper font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {t("auth_go_login")}
        </Link>
      </div>
    );
  }

  const pendingIncoming = incoming.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
        {t("dashboard_title")}
      </h1>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={listings.filter((l) => l.status === "active").length} label={t("dashboard_stat_listings")} />
        <StatCard value={rentals.filter((r) => r.status === "active").length} label={t("dashboard_stat_rentals")} />
        <StatCard value={pendingIncoming} label={t("dashboard_stat_incoming")} />
        <StatCard value={favorites.length} label={t("dashboard_stat_favorites")} />
      </div>

      <Section title={t("dashboard_section_incoming")}>
        {incoming.length === 0 ? (
          <p className="text-sm text-ink/50">{t("dashboard_no_incoming")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {incoming.map((r) => (
              <div
                key={r.id}
                className="bg-cream-card border border-steel-light rounded-lg px-4 py-3.5 flex items-center justify-between gap-3 flex-wrap"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {r.rentals?.title} — {formatDate(r.start_date)} – {formatDate(r.end_date)}
                  </p>
                  <p className="text-xs text-ink/55">
                    {t("dashboard_requested_by")}: {r.requester?.full_name}
                  </p>
                </div>
                {r.status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateReservationStatus(r.id, "confirmed")}
                      className="text-xs font-semibold bg-moss text-paper px-3 py-1.5 rounded-md hover:bg-moss-dark transition-colors"
                    >
                      {t("dashboard_confirm")}
                    </button>
                    <button
                      onClick={() => updateReservationStatus(r.id, "declined")}
                      className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors"
                    >
                      {t("dashboard_decline")}
                    </button>
                  </div>
                ) : (
                  <StatusBadge status={r.status} t={t} />
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("dashboard_section_my_requests")}>
        {myRequests.length === 0 ? (
          <p className="text-sm text-ink/50">{t("dashboard_no_my_requests")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myRequests.map((r) => (
              <div
                key={r.id}
                className="bg-cream-card border border-steel-light rounded-lg px-4 py-3.5 flex items-center justify-between gap-3 flex-wrap"
              >
                <p className="text-sm font-medium text-ink">
                  {r.rentals?.title} — {formatDate(r.start_date)} – {formatDate(r.end_date)}
                </p>
                <StatusBadge status={r.status} t={t} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("dashboard_section_stats")}>
        {itemStats.length === 0 ? (
          <p className="text-sm text-ink/50">{t("dashboard_no_listings")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink/50 border-b border-steel-light">
                  <th className="pb-2 font-medium">{t("dashboard_stats_title_col")}</th>
                  <th className="pb-2 font-medium">{t("dashboard_stats_views_col")}</th>
                  <th className="pb-2 font-medium">{t("dashboard_stats_favorites_col")}</th>
                  <th className="pb-2 font-medium">{t("dashboard_stats_rating_col")}</th>
                </tr>
              </thead>
              <tbody>
                {itemStats.map((s) => (
                  <tr key={`${s.type}-${s.id}`} className="border-b border-steel-light/50">
                    <td className="py-2.5">
                      <Link href={s.href} className="text-moss-dark hover:underline font-medium">
                        {s.title}
                      </Link>
                    </td>
                    <td className="py-2.5 text-ink/70">{s.views}</td>
                    <td className="py-2.5 text-ink/70">{s.favorites}</td>
                    <td className="py-2.5 text-ink/70">
                      {s.avgRating !== null ? `${s.avgRating.toFixed(1)} (${s.ratingCount})` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title={t("dashboard_section_listings")}>
        {listings.length === 0 ? (
          <p className="text-sm text-ink/50">{t("dashboard_no_listings")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {listings.map((l) => (
              <div
                key={l.id}
                className="bg-cream-card border border-steel-light rounded-lg px-4 py-3.5 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <Link href={`/kjop-og-selg/${l.id}`} className="text-sm font-medium text-ink hover:text-moss-dark truncate">
                    {l.title}
                  </Link>
                  <p className="text-xs text-ink/55 mt-0.5">
                    {new Intl.NumberFormat("nb-NO").format(l.price)} kr
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ItemStatusBadge status={l.status} labels={listingStatusLabels(t)} />
                  {l.status === "active" && (
                    <button
                      onClick={() => updateListingStatus(l.id, "sold")}
                      className="text-xs font-semibold bg-moss text-paper px-3 py-1.5 rounded-md hover:bg-moss-dark transition-colors"
                    >
                      {t("dashboard_mark_sold")}
                    </button>
                  )}
                  {l.status === "sold" && (
                    <button
                      onClick={() => updateListingStatus(l.id, "active")}
                      className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors"
                    >
                      {t("dashboard_reactivate")}
                    </button>
                  )}
                  {l.status !== "removed" && (
                    <button
                      onClick={() => updateListingStatus(l.id, "removed")}
                      className="text-xs font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors"
                    >
                      {t("dashboard_remove_listing")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("dashboard_section_rentals")}>
        {rentals.length === 0 ? (
          <p className="text-sm text-ink/50">{t("dashboard_no_rentals")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rentals.map((r) => (
              <div
                key={r.id}
                className="bg-cream-card border border-steel-light rounded-lg px-4 py-3.5 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <Link href={`/lei/${r.id}`} className="text-sm font-medium text-ink hover:text-moss-dark truncate">
                    {r.title}
                  </Link>
                  <p className="text-xs text-ink/55 mt-0.5">
                    {new Intl.NumberFormat("nb-NO").format(r.dailyPrice)} kr/dag
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ItemStatusBadge status={r.status} labels={rentalStatusLabels(t)} />
                  {r.status === "active" && (
                    <button
                      onClick={() => updateRentalStatus(r.id, "paused")}
                      className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors"
                    >
                      {t("dashboard_pause_rental")}
                    </button>
                  )}
                  {r.status === "paused" && (
                    <button
                      onClick={() => updateRentalStatus(r.id, "active")}
                      className="text-xs font-semibold bg-moss text-paper px-3 py-1.5 rounded-md hover:bg-moss-dark transition-colors"
                    >
                      {t("dashboard_resume_rental")}
                    </button>
                  )}
                  {r.status !== "removed" && (
                    <button
                      onClick={() => updateRentalStatus(r.id, "removed")}
                      className="text-xs font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors"
                    >
                      {t("dashboard_remove_listing")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("dashboard_section_favorites")}>
        {favorites.length === 0 ? (
          <p className="text-sm text-ink/50">{t("dashboard_no_favorites")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favorites.map((f) => (
              <Link
                key={`${f.type}-${f.id}`}
                href={f.href}
                className="flex items-center gap-3 bg-cream-card border border-steel-light rounded-lg px-4 py-3.5 hover:border-moss/50 transition-colors"
              >
                <Heart size={16} className="fill-barn text-barn shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{f.title}</p>
                  <p className="text-xs text-ink/55">{f.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("dashboard_section_shortcuts")}>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/ny-annonse"
            className="text-sm font-semibold bg-moss text-paper px-4 py-2.5 rounded-lg hover:bg-moss-dark transition-colors"
          >
            {t("dashboard_new_listing")}
          </Link>
          <Link
            href="/meldinger"
            className="text-sm font-semibold border border-steel-light px-4 py-2.5 rounded-lg hover:bg-sage/30 transition-colors"
          >
            {t("dashboard_go_messages")}
          </Link>
          <Link
            href="/min-profil"
            className="text-sm font-semibold border border-steel-light px-4 py-2.5 rounded-lg hover:bg-sage/30 transition-colors"
          >
            {t("dashboard_edit_profile")}
          </Link>
        </div>
      </Section>
    </div>
  );
}

function listingStatusLabels(t: (k: never) => string) {
  return {
    active: t("dashboard_status_active" as never),
    sold: t("dashboard_status_sold" as never),
    removed: t("dashboard_status_removed_item" as never),
  };
}

function rentalStatusLabels(t: (k: never) => string) {
  return {
    active: t("dashboard_status_active" as never),
    paused: t("dashboard_status_paused" as never),
    removed: t("dashboard_status_removed_item" as never),
  };
}

function ItemStatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colors: Record<string, string> = {
    active: "bg-sage/60 text-moss-dark",
    sold: "bg-steel-light/60 text-ink/60",
    paused: "bg-steel-light/60 text-ink/60",
    removed: "bg-barn/10 text-barn",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-cream-card border border-steel-light rounded-xl p-4">
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink/55 mt-0.5">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 pt-8 border-t border-steel-light">
      <h2 className="font-display font-semibold text-ink text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: (k: never) => string }) {
  const labelKey =
    status === "confirmed"
      ? "dashboard_status_confirmed"
      : status === "declined"
        ? "dashboard_status_declined"
        : status === "cancelled"
          ? "dashboard_status_cancelled"
          : "dashboard_status_pending";
  const colors =
    status === "confirmed"
      ? "bg-sage/60 text-moss-dark"
      : status === "declined" || status === "cancelled"
        ? "bg-barn/10 text-barn"
        : "bg-steel-light/60 text-ink/60";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors}`}>
      {t(labelKey as never)}
    </span>
  );
}
