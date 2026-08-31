"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { RentalListing } from "@/data/rentals";
import FavoriteButton from "./FavoriteButton";

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function RentalCard({ listing }: { listing: RentalListing }) {
  const { t } = useLanguage();
  return (
    <Link
      href={`/lei/${listing.id}`}
      className="group bg-cream-card border border-steel-light rounded-xl overflow-hidden hover:shadow-md hover:border-moss/50 transition-all flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-sage overflow-hidden">
        {listing.imageUrls && listing.imageUrls.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrls[0]}
            alt={listing.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-moss-dark/40 font-tag text-xs px-4 text-center">
            {listing.imageQuery}
          </div>
        )}
        <FavoriteButton type="rental" id={listing.id} />
        <span className="absolute bottom-3 left-3 font-tag text-[11px] uppercase tracking-wide bg-paper/90 backdrop-blur px-2 py-1 rounded text-ink/70">
          {listing.category}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-semibold text-ink leading-snug">
          {listing.title}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-tag text-lg font-semibold text-moss-dark">
            {formatNOK(listing.dailyPrice)}
            <span className="text-xs font-body text-ink/50">{t("rent_daily_suffix")}</span>
          </span>
          <span className="font-tag text-sm text-ink/45">
            {formatNOK(listing.weeklyPrice)}
            <span className="text-xs font-body text-ink/45">{t("rent_weekly_suffix")}</span>
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-steel-light/60 flex items-center justify-between text-xs text-ink/55 mt-auto">
          <span className="flex items-center gap-1">
            <MapPin size={13} />
            {listing.location}
          </span>
          <span>{listing.distanceKm} km unna</span>
        </div>
      </div>
    </Link>
  );
}
