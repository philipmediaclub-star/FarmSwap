"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LocateFixed } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { fetchListings } from "@/lib/data/listings";
import { fetchRentals } from "@/lib/data/rentals";
import { haversineKm } from "@/lib/geo";
import { useUserLocation } from "@/lib/useUserLocation";
import type { Listing } from "@/data/listings";
import type { RentalListing } from "@/data/rentals";
import ListingCard from "./ListingCard";
import RentalCard from "./RentalCard";

const RADIUS_KM = 30;
const MAX_ITEMS = 8;

type NearbyItem =
  | { kind: "sell"; km: number; listing: Listing }
  | { kind: "rent"; km: number; listing: RentalListing };

export default function ListingsTeaser() {
  const { t } = useLanguage();
  const { origin, ready, busy, error, setZip, locateDevice, clear } = useUserLocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [rentals, setRentals] = useState<RentalListing[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([fetchListings(), fetchRentals()]).then(([l, r]) => {
      setListings(l.listings);
      setRentals(r.rentals);
      setLoaded(true);
    });
  }, []);

  // Everything within RADIUS_KM of the visitor, closest first.
  const nearby = useMemo<NearbyItem[]>(() => {
    if (!origin) return [];
    const items: NearbyItem[] = [];
    for (const l of listings) {
      if (l.lat == null || l.lng == null) continue;
      const km = haversineKm(origin, { lat: l.lat, lng: l.lng });
      if (km <= RADIUS_KM) items.push({ kind: "sell", km, listing: { ...l, distanceKm: Math.max(1, Math.round(km)) } });
    }
    for (const r of rentals) {
      if (r.lat == null || r.lng == null) continue;
      const km = haversineKm(origin, { lat: r.lat, lng: r.lng });
      if (km <= RADIUS_KM) items.push({ kind: "rent", km, listing: { ...r, distanceKm: Math.max(1, Math.round(km)) } });
    }
    return items.sort((a, b) => a.km - b.km).slice(0, MAX_ITEMS);
  }, [origin, listings, rentals]);

  if (!loaded || !ready) return null;
  // Nothing on the site yet - don't show an empty section.
  if (listings.length === 0 && rentals.length === 0) return null;

  async function submitZip(e: React.FormEvent) {
    e.preventDefault();
    if (await setZip(zipInput)) {
      setEditing(false);
      setZipInput("");
    }
  }

  const showForm = !origin || editing;

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
            <p className="mt-1.5 text-sm text-ink/65">
              {origin
                ? t("nearby_radius").replace("{km}", String(RADIUS_KM)).replace("{place}", origin.label)
                : t("nearby_prompt")}
              {origin && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="ml-2 font-semibold text-moss-dark hover:underline"
                >
                  {t("nearby_change")}
                </button>
              )}
            </p>
          </div>
          <Link
            href="/kjop-og-selg"
            className="flex items-center gap-1.5 text-sm font-semibold text-moss-dark hover:gap-2.5 transition-all"
          >
            {t("listings_cta")}
            <ArrowRight size={16} />
          </Link>
        </div>

        {showForm && (
          <form onSubmit={submitZip} className="mt-5 flex flex-wrap items-center gap-2">
            <input
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder={t("nearby_zip_placeholder")}
              aria-label={t("nearby_zip_placeholder")}
              className="w-32 px-3.5 py-2.5 rounded-lg bg-paper border border-steel-light outline-none focus:border-moss text-sm"
            />
            <button
              type="submit"
              disabled={busy || zipInput.length !== 4}
              className="bg-moss hover:bg-moss-dark disabled:opacity-50 text-paper text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {t("nearby_show")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                locateDevice(t("nearby_my_position"));
                setEditing(false);
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-moss-dark border border-moss/30 px-3.5 py-2.5 rounded-lg hover:bg-paper/70 transition-colors"
            >
              <LocateFixed size={15} />
              {t("nearby_use_location")}
            </button>
            {origin && (
              <button type="button" onClick={() => { clear(); setEditing(false); }} className="text-xs text-ink/55 hover:underline">
                {t("nearby_clear")}
              </button>
            )}
            {error === "zip" && <span className="text-sm text-barn">{t("nearby_zip_error")}</span>}
            {error === "geo" && <span className="text-sm text-barn">{t("nearby_geo_error")}</span>}
          </form>
        )}

        {origin ? (
          nearby.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {nearby.map((item) =>
                item.kind === "sell" ? (
                  <ListingCard key={`s-${item.listing.id}`} listing={item.listing} />
                ) : (
                  <RentalCard key={`r-${item.listing.id}`} listing={item.listing} />
                )
              )}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink/65">
              {t("nearby_none").replace("{km}", String(RADIUS_KM))}
            </p>
          )
        ) : (
          listings.length > 0 && (
            <>
              <p className="mt-8 mb-3 text-sm font-medium text-ink/70">{t("nearby_latest")}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {listings.slice(0, 4).map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </>
          )
        )}
      </div>
    </section>
  );
}
