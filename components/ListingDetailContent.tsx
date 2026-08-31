"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { Listing } from "@/data/listings";
import { createClient } from "@/lib/supabase/client";
import ContactSellerModal from "./ContactSellerModal";
import ReportButton from "./ReportButton";
import ListingStatsRow from "./ListingStatsRow";
import ItemReviewSection from "./ItemReviewSection";

export type FullListing = Listing & {
  description: string;
  imageUrls: string[];
  sellerId: string | null;
};

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function ListingDetailContent({ listing }: { listing: FullListing }) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [views, setViews] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!listing.sellerId) return; // demo/mock listing — nothing real to track
    const supabase = createClient();

    supabase.rpc("increment_listing_views", { p_id: listing.id }).then(() => {
      supabase
        .from("listings")
        .select("view_count")
        .eq("id", listing.id)
        .single()
        .then(({ data }) => setViews(data?.view_count ?? 0));
    });

    supabase
      .from("favorites")
      .select("user_id", { count: "exact", head: true })
      .eq("listing_type", "listing")
      .eq("listing_id", listing.id)
      .then(({ count }) => setFavCount(count ?? 0));

    supabase
      .from("listing_reviews")
      .select("rating")
      .eq("listing_type", "listing")
      .eq("listing_id", listing.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAvgRating(data.reduce((s, r) => s + r.rating, 0) / data.length);
          setRatingCount(data.length);
        }
      });
  }, [listing.id, listing.sellerId]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/kjop-og-selg"
        className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-moss-dark"
      >
        <ArrowLeft size={16} />
        {t("buysell_back")}
      </Link>

      <div className="mt-4 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {listing.imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {listing.imageUrls.slice(0, 4).map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt={listing.title}
                  className="aspect-[4/3] object-cover rounded-xl first:col-span-2 first:aspect-[16/10]"
                />
              ))}
            </div>
          ) : (
            <div className="aspect-[16/10] bg-sage rounded-xl flex items-center justify-center text-moss-dark/40 font-tag text-sm">
              {listing.imageQuery}
            </div>
          )}

          <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-ink">
            {listing.title}
          </h1>

          <div className="mt-2 flex items-center gap-1 text-sm text-ink/60">
            <MapPin size={14} /> {listing.location}
          </div>

          {listing.sellerId && (
            <div className="mt-2">
              <ListingStatsRow
                views={views}
                favoriteCount={favCount}
                avgRating={avgRating}
                ratingCount={ratingCount}
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {listing.condition && <Tag>{listing.condition}</Tag>}
            {listing.year && <Tag>{listing.year}</Tag>}
            {listing.hours && <Tag>{listing.hours.toLocaleString("nb-NO")} timer</Tag>}
            <Tag>{listing.category}</Tag>
          </div>

          {listing.description && (
            <p className="mt-6 text-sm text-ink/70 leading-relaxed">{listing.description}</p>
          )}

          {listing.sellerId && (
            <ItemReviewSection listingType="listing" listingId={listing.id} />
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-cream-card border border-steel-light rounded-xl p-5">
            <p className="font-tag text-2xl font-bold text-moss-dark">
              {formatNOK(listing.price)}
            </p>
            {listing.sellerName && (
              listing.sellerId ? (
                <Link href={`/profil/${listing.sellerId}`} className="mt-1 block text-sm text-moss-dark hover:underline">
                  {listing.sellerName}
                </Link>
              ) : (
                <p className="mt-1 text-sm text-ink/60">{listing.sellerName}</p>
              )
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 w-full bg-moss hover:bg-moss-dark text-paper font-semibold py-3 rounded-lg transition-colors"
            >
              {t("contact_seller_button")}
            </button>

            <div className="mt-3 text-center">
              <ReportButton listingType="listing" listingId={listing.id} />
            </div>
          </div>
        </div>
      </div>

      <ContactSellerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sellerId={listing.sellerId}
        listingId={listing.id}
        buttonLabel={t("contact_seller_button")}
      />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-tag text-xs uppercase tracking-wide bg-sage/60 text-moss-dark px-2.5 py-1 rounded">
      {children}
    </span>
  );
}
