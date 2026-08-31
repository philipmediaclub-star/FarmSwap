"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { getUnavailableForListing } from "@/lib/dates";
import type { RentalListing } from "@/data/rentals";
import { createClient } from "@/lib/supabase/client";
import AvailabilityCalendar from "./AvailabilityCalendar";
import ReservationModal from "./ReservationModal";
import ContactSellerModal from "./ContactSellerModal";
import ReportButton from "./ReportButton";
import ListingStatsRow from "./ListingStatsRow";
import ItemReviewSection from "./ItemReviewSection";

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function RentalDetailContent({
  listing,
  ownerId,
}: {
  listing: RentalListing;
  ownerId: string | null;
}) {
  const { t } = useLanguage();
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [views, setViews] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!ownerId) return; // demo/mock listing — nothing real to track
    const supabase = createClient();

    supabase.rpc("increment_rental_views", { p_id: listing.id }).then(() => {
      supabase
        .from("rentals")
        .select("view_count")
        .eq("id", listing.id)
        .single()
        .then(({ data }) => setViews(data?.view_count ?? 0));
    });

    supabase
      .from("favorites")
      .select("user_id", { count: "exact", head: true })
      .eq("listing_type", "rental")
      .eq("listing_id", listing.id)
      .then(({ count }) => setFavCount(count ?? 0));

    supabase
      .from("listing_reviews")
      .select("rating")
      .eq("listing_type", "rental")
      .eq("listing_id", listing.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAvgRating(data.reduce((s, r) => s + r.rating, 0) / data.length);
          setRatingCount(data.length);
        }
      });
  }, [listing.id, ownerId]);

  const unavailable = useMemo(
    () => [...getUnavailableForListing(listing.id), ...listing.unavailableDates],
    [listing]
  );

  const dayCount = range
    ? Math.round(
        (new Date(range.end).getTime() - new Date(range.start).getTime()) /
          86400000
      ) + 1
    : 0;
  const totalPrice = dayCount * listing.dailyPrice;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/lei"
        className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-moss-dark"
      >
        <ArrowLeft size={16} />
        {t("rent_back")}
      </Link>

      <div className="mt-4 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {listing.imageUrls && listing.imageUrls.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrls[0]}
              alt={listing.title}
              className="aspect-[16/10] w-full object-cover rounded-xl"
            />
          ) : (
            <div className="aspect-[16/10] bg-sage rounded-xl flex items-center justify-center text-moss-dark/40 font-tag text-sm">
              {listing.imageQuery}
            </div>
          )}

          <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-ink">
            {listing.title}
          </h1>

          <div className="mt-2 flex items-center gap-4 text-sm text-ink/60">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {listing.location} · {listing.distanceKm} km unna
            </span>
            <span className="flex items-center gap-1">
              <User size={14} /> {t("rent_owner_label")}:{" "}
              {ownerId ? (
                <Link href={`/profil/${ownerId}`} className="text-moss-dark hover:underline">
                  {listing.owner}
                </Link>
              ) : (
                listing.owner
              )}
            </span>
          </div>

          {ownerId && (
            <div className="mt-3">
              <ListingStatsRow
                views={views}
                favoriteCount={favCount}
                avgRating={avgRating}
                ratingCount={ratingCount}
              />
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-display font-semibold text-ink">
              {t("rent_description_title")}
            </h2>
            <p className="mt-2 text-sm text-ink/70 leading-relaxed">{listing.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="font-display font-semibold text-ink">
              {t("rent_conditions_title")}
            </h2>
            <p className="mt-2 text-sm text-ink/70 leading-relaxed">{listing.conditions}</p>
          </div>

          {ownerId && <ItemReviewSection listingType="rental" listingId={listing.id} />}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-cream-card border border-steel-light rounded-xl p-5">
            <div className="flex items-baseline gap-2">
              <span className="font-tag text-2xl font-bold text-moss-dark">
                {formatNOK(listing.dailyPrice)}
              </span>
              <span className="text-sm text-ink/50">{t("rent_daily_suffix")}</span>
            </div>
            <p className="text-xs text-ink/50 mt-0.5">
              {formatNOK(listing.weeklyPrice)} {t("rent_weekly_suffix")}
            </p>

            <div className="mt-5 pt-5 border-t border-steel-light">
              <h3 className="font-display font-semibold text-ink text-sm">
                {t("rent_calendar_title")}
              </h3>
              <p className="text-xs text-ink/50 mt-1 mb-3">{t("rent_select_hint")}</p>
              <AvailabilityCalendar
                unavailableDates={unavailable}
                onRangeChange={setRange}
              />
            </div>

            <div className="mt-5 pt-5 border-t border-steel-light">
              <p className="text-xs text-ink/50">{t("rent_selected_range_label")}</p>
              {range ? (
                <>
                  <p className="text-sm font-medium text-ink mt-1">
                    {formatDate(range.start)} – {formatDate(range.end)} ({dayCount}{" "}
                    {t("rent_days_unit")})
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-ink/50">{t("rent_total_label")}</span>
                    <span className="font-tag font-semibold text-moss-dark">
                      {formatNOK(totalPrice)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink/40 mt-1">{t("rent_no_selection")}</p>
              )}

              <button
                onClick={() => setModalOpen(true)}
                disabled={!range}
                className="mt-4 w-full bg-moss hover:bg-moss-dark disabled:opacity-40 disabled:cursor-not-allowed text-paper font-semibold py-3 rounded-lg transition-colors"
              >
                {t("rent_reserve_button")}
              </button>
              <button
                onClick={() => setContactModalOpen(true)}
                className="mt-2 w-full border border-moss/30 text-moss-dark font-semibold py-3 rounded-lg hover:bg-sage/50 transition-colors"
              >
                {t("contact_owner_button")}
              </button>

              <div className="mt-3 text-center">
                <ReportButton listingType="rental" listingId={listing.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ownerName={listing.owner}
        totalPrice={totalPrice}
        dayCount={dayCount}
        rentalId={ownerId ? listing.id : null}
        range={range}
      />

      <ContactSellerModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        sellerId={ownerId}
        listingId={listing.id}
        buttonLabel={t("contact_owner_button")}
      />
    </div>
  );
}
