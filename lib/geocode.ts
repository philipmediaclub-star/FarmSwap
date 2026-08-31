let loadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.resolve();

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geocoding`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Geocodes a free-text place name (e.g. "Hamar" or "Innlandet") into
 * coordinates, biased to Norway. Returns null if geocoding isn't available
 * or the place can't be resolved — callers should fall back gracefully
 * (the map page already does, via the region-based approximation).
 */
export async function geocodeLocation(
  text: string
): Promise<{ lat: number; lng: number } | null> {
  if (!text.trim()) return null;

  try {
    await loadGoogleMapsScript();
    if (!window.google?.maps) return null;

    const geocoder = new window.google.maps.Geocoder();
    const result = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      geocoder.geocode(
        { address: text, componentRestrictions: { country: "NO" } },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve(null);
          }
        }
      );
    });

    return result;
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    google?: {
      maps: {
        Geocoder: new () => {
          geocode: (
            request: { address: string; componentRestrictions?: { country: string } },
            callback: (
              results: { geometry: { location: { lat: () => number; lng: () => number } } }[] | null,
              status: string
            ) => void
          ) => void;
        };
      };
    };
  }
}
