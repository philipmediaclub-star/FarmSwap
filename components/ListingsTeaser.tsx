"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { fetchListings } from "@/lib/data/listings";
import type { Listing } from "@/data/listings";
import ListingCard from "./ListingCard";

export default function ListingsTeaser() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchListings().then(({ listings }) => setListings(listings.slice(0, 4)));
  }, []);

  // Nothing real to show yet — hide the section instead of showing demo data.
  if (listings.length === 0) return null;

  return (
    <section className="bg-sage/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-moss font-semibold">
              {t("listings_eyebrow")}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              {t("listings_title")}
            </h2>
          </div>
          <Link
            href="/kjop-og-selg"
            className="flex items-center gap-1.5 text-sm font-semibold text-moss-dark hover:gap-2.5 transition-all"
          >
            {t("listings_cta")}
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
