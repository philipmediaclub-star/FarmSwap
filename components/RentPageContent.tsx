"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { fetchRentals } from "@/lib/data/rentals";
import type { RentalListing } from "@/data/rentals";
import RentalCard from "./RentalCard";

export default function RentPageContent() {
  const { t } = useLanguage();
  const [rentals, setRentals] = useState<RentalListing[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals().then(({ rentals, isLive }) => {
      setRentals(rentals);
      setIsLive(isLive);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
          {t("rent_page_title")}
        </h1>
        {!loading && !isLive && (
          <span className="text-xs font-tag uppercase tracking-wide text-steel border border-steel-light rounded-full px-2.5 py-1">
            {t("demo_data_badge")}
          </span>
        )}
      </div>
      <p className="mt-2 text-ink/65">{t("rent_page_subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rentals.map((listing) => (
          <RentalCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
