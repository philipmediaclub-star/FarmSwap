"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { fetchListings } from "@/lib/data/listings";
import { fetchRentals } from "@/lib/data/rentals";
import { approximateLocation } from "@/lib/geo";
import MapView, { type MapPin } from "./MapView";

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function MapPageContent() {
  const { t } = useLanguage();
  const [pins, setPins] = useState<MapPin[]>([]);

  useEffect(() => {
    Promise.all([fetchListings(), fetchRentals()]).then(([listingsRes, rentalsRes]) => {
      const listingPins: MapPin[] = listingsRes.listings.map((l) => {
        const { lat, lng } = approximateLocation(l.location, l.id);
        return {
          id: `sell-${l.id}`,
          title: l.title,
          type: "sell",
          priceLabel: formatNOK(l.price),
          location: l.location,
          lat,
          lng,
          href: `/kjop-og-selg/${l.id}`,
        };
      });

      const rentalPins: MapPin[] = rentalsRes.rentals.map((r) => {
        const { lat, lng } = approximateLocation(r.location, r.id);
        return {
          id: `rent-${r.id}`,
          title: r.title,
          type: "rent",
          priceLabel: `${formatNOK(r.dailyPrice)}/dag`,
          location: r.location,
          lat,
          lng,
          href: `/lei/${r.id}`,
        };
      });

      setPins([...listingPins, ...rentalPins]);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
        {t("map_page_title")}
      </h1>
      <p className="mt-2 text-ink/65">{t("map_page_subtitle")}</p>

      <div className="mt-8 flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-barn inline-block" /> {t("map_type_sell")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-moss inline-block" /> {t("map_type_rent")}
        </span>
      </div>

      <div className="mt-4">
        <MapView pins={pins} />
      </div>
    </div>
  );
}
