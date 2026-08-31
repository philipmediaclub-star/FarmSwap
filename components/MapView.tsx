"use client";

import { useState } from "react";
import Link from "next/link";
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { useLanguage } from "@/lib/i18n";

export type MapPin = {
  id: string;
  title: string;
  type: "sell" | "rent";
  priceLabel: string;
  location: string;
  lat: number;
  lng: number;
  href: string;
};

export default function MapView({ pins }: { pins: MapPin[] }) {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-dashed border-steel-light bg-cream-card p-10 text-center">
        <h2 className="font-display font-semibold text-ink">{t("map_missing_key_title")}</h2>
        <p className="mt-2 text-sm text-ink/60 max-w-md mx-auto">{t("map_missing_key_body")}</p>
      </div>
    );
  }

  const active = pins.find((p) => p.id === activeId);

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-[70vh] rounded-xl overflow-hidden border border-steel-light">
        <Map
          mapId="farmswap-map"
          defaultCenter={{ lat: 63.5, lng: 11.0 }}
          defaultZoom={5}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {pins.map((pin) => (
            <AdvancedMarker
              key={pin.id}
              position={{ lat: pin.lat, lng: pin.lng }}
              onClick={() => setActiveId(pin.id)}
            >
              <Pin
                background={pin.type === "rent" ? "#435E3A" : "#A34A34"}
                borderColor="#2B2620"
                glyphColor="#EEE8D9"
              />
            </AdvancedMarker>
          ))}

          {active && (
            <InfoWindow
              position={{ lat: active.lat, lng: active.lng }}
              onCloseClick={() => setActiveId(null)}
            >
              <div className="p-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-moss-dark">
                  {active.type === "rent" ? t("map_type_rent") : t("map_type_sell")}
                </span>
                <p className="font-semibold text-ink text-sm mt-0.5">{active.title}</p>
                <p className="text-xs text-ink/60">{active.location}</p>
                <p className="text-sm font-semibold text-ink mt-1">{active.priceLabel}</p>
                <Link
                  href={active.href}
                  className="mt-2 inline-block text-xs font-semibold text-moss-dark hover:underline"
                >
                  {t("map_view_listing")} →
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
