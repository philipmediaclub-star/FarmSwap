"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { geocodeLocation } from "@/lib/geocode";

export type UserOrigin = { lat: number; lng: number; label: string };

export const ORIGIN_STORAGE_KEY = "farmswap_origin";

function readCached(): UserOrigin | null {
  try {
    const raw = localStorage.getItem(ORIGIN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserOrigin) : null;
  } catch {
    return null;
  }
}

function writeCached(o: UserOrigin | null) {
  try {
    if (o) localStorage.setItem(ORIGIN_STORAGE_KEY, JSON.stringify(o));
    else localStorage.removeItem(ORIGIN_STORAGE_KEY);
  } catch {
    /* storage unavailable - fine, we just won't remember it */
  }
}

/**
 * Works out where the visitor is, in this order:
 *  1. a location they chose earlier (remembered in this browser)
 *  2. the postal code on their FarmSwap profile
 * and lets them set it by typing a postal code or using the device location.
 */
export function useUserLocation() {
  const [origin, setOrigin] = useState<UserOrigin | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"zip" | "geo" | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = readCached();
      if (cached) {
        setOrigin(cached);
        setReady(true);
        return;
      }
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: p } = await supabase
            .from("profiles")
            .select("postal_code, city")
            .eq("id", data.user.id)
            .maybeSingle();
          if (p?.postal_code && p?.city) {
            const coords = await geocodeLocation(`${p.postal_code} ${p.city}`);
            if (coords && !cancelled) {
              const o = { ...coords, label: `${p.postal_code} ${p.city}` };
              writeCached(o);
              setOrigin(o);
            }
          }
        }
      } catch {
        /* no profile location - the visitor can type a postal code instead */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setZip = useCallback(async (zipInput: string) => {
    const zip = zipInput.replace(/\D/g, "");
    setError(null);
    if (zip.length !== 4) {
      setError("zip");
      return false;
    }
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.from("postal_codes").select("city").eq("zip", zip).maybeSingle();
    if (!data?.city) {
      setBusy(false);
      setError("zip");
      return false;
    }
    const coords = await geocodeLocation(`${zip} ${data.city}`);
    setBusy(false);
    if (!coords) {
      setError("geo");
      return false;
    }
    const o = { ...coords, label: `${zip} ${data.city}` };
    writeCached(o);
    setOrigin(o);
    return true;
  }, []);

  const locateDevice = useCallback((label: string) => {
    setError(null);
    if (!navigator.geolocation) {
      setError("geo");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const o = { lat: pos.coords.latitude, lng: pos.coords.longitude, label };
        writeCached(o);
        setOrigin(o);
        setBusy(false);
      },
      () => {
        setBusy(false);
        setError("geo");
      },
      { timeout: 10000 }
    );
  }, []);

  const clear = useCallback(() => {
    writeCached(null);
    setOrigin(null);
  }, []);

  return { origin, ready, busy, error, setZip, locateDevice, clear };
}
