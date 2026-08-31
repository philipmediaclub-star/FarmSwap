"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { fetchListings } from "@/lib/data/listings";
import type { Listing } from "@/data/listings";
import ListingCard from "./ListingCard";

export default function BuySellResults({ initialQuery }: { initialQuery: string }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings().then(({ listings, isLive }) => {
      setAllListings(listings);
      setIsLive(isLive);
      setLoading(false);
    });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allListings;
    return allListings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }, [query, allListings]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
          {t("buysell_page_title")}
        </h1>
        {!loading && !isLive && (
          <span className="text-xs font-tag uppercase tracking-wide text-steel border border-steel-light rounded-full px-2.5 py-1">
            {t("demo_data_badge")}
          </span>
        )}
      </div>

      <label className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-cream-card border border-steel-light max-w-xl">
        <Search size={18} className="text-steel shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder={t("search_placeholder")}
          className="w-full bg-transparent outline-none text-ink placeholder:text-steel text-[15px]"
        />
      </label>

      <p className="mt-4 text-sm text-ink/60">
        {query
          ? `${t("buysell_results_for")} "${query}"`
          : t("buysell_all_listings")}
      </p>

      {results.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {results.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="mt-10 text-center py-16 border border-dashed border-steel-light rounded-xl">
          <p className="text-ink/60">{t("buysell_none_found")}</p>
          <button
            onClick={() => setQuery("")}
            className="mt-4 text-sm font-semibold text-moss-dark hover:underline"
          >
            {t("buysell_clear")}
          </button>
        </div>
      )}
    </div>
  );
}
