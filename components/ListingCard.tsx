"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Listing } from "@/data/listings";
import FavoriteButton from "./FavoriteButton";

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/kjop-og-selg/${listing.id}`}
      className="group bg-cream-card border border-steel-light rounded-xl overflow-hidden hover:shadow-md hover:border-moss/50 transition-all block"
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
        <FavoriteButton type="listing" id={listing.id} />
        {listing.condition && (
          <span className="absolute bottom-3 left-3 font-tag text-[11px] uppercase tracking-wide bg-paper/90 backdrop-blur px-2 py-1 rounded text-ink/70">
            {listing.condition}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-ink leading-snug">
          {listing.title}
        </h3>
        <p className="font-tag text-lg font-semibold text-moss-dark mt-1">
          {formatNOK(listing.price)}
          {listing.category === "Utleie" && (
            <span className="text-xs font-body text-ink/50"> /dag</span>
          )}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/60">
          {listing.year && <span>{listing.year}</span>}
          {listing.hours && <span>{listing.hours.toLocaleString("nb-NO")} timer</span>}
          <span>{listing.category}</span>
        </div>

        <div className="mt-3 pt-3 border-t border-steel-light/60 flex items-center justify-between text-xs text-ink/55">
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
