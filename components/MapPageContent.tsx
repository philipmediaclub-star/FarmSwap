"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { featuredListings } from "@/data/listings";
import { rentalListings } from "@/data/rentals";
import { approximateLocation } from "@/lib/geo";
import MapView, { type MapPin } from "./MapView";

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function MapPageContent() {
  const { t } = useLanguage();
  const [pins, setPins] = useState<MapPin[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [{ data: listingRows }, { data: rentalRows }] = await Promise.all([
        supabase
          .from("listings")
          .select("id, title, price, location, latitude, longitude")
          .eq("status", "active"),
        supabase
          .from("rentals")
          .select("id, title, daily_price, location, latitude, longitude")
          .eq("status", "active"),
      ]);

      const hasLive = (listingRows && listingRows.length > 0) || (rentalRows && rentalRows.length > 0);

      const listingPins: MapPin[] = hasLive
        ? (listingRows ?? []).map((l) => {
            const coords =
              l.latitude && l.longitude
                ? { lat: Number(l.latitude), lng: Number(l.longitude) }
                : approximateLocation(l.location, l.id);
            return {
              id: `sell-${l.id}`,
              title: l.title,
              type: "sell" as const,
              priceLabel: formatNOK(Number(l.price)),
              location: l.location,
              lat: coords.lat,
              lng: coords.lng,
              href: `/kjop-og-selg/${l.id}`,
            };
          })
        : featuredListings.map((l) => {
            const coords = approximateLocation(l.location, l.id);
            return {
              id: `sell-${l.id}`,
              title: l.title,
              type: "sell" as const,
              priceLabel: formatNOK(l.price),
              location: l.location,
              lat: coords.lat,
              lng: coords.lng,
              href: `/kjop-og-selg/${l.id}`,
            };
          });

      const rentalPins: MapPin[] = hasLive
        ? (rentalRows ?? []).map((r) => {
            const coords =
              r.latitude && r.longitude
                ? { lat: Number(r.latitude), lng: Number(r.longitude) }
                : approximateLocation(r.location, r.id);
            return {
              id: `rent-${r.id}`,
              title: r.title,
              type: "rent" as const,
              priceLabel: `${formatNOK(Number(r.daily_price))}/dag`,
              location: r.location,
              lat: coords.lat,
              lng: coords.lng,
              href: `/lei/${r.id}`,
            };
          })
        : rentalListings.map((r) => {
            const coords = approximateLocation(r.location, r.id);
            return {
              id: `rent-${r.id}`,
              title: r.title,
              type: "rent" as const,
              priceLabel: `${formatNOK(r.dailyPrice)}/dag`,
              location: r.location,
              lat: coords.lat,
              lng: coords.lng,
              href: `/lei/${r.id}`,
            };
          });

      setPins([...listingPins, ...rentalPins]);
    }

    load();
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
