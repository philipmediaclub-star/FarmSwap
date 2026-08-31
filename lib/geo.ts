// Approximate centers for Norwegian regions (fylker). Listings only ever
// store a region/place name, not a street address, and the map only ever
// shows an approximate point — real exact locations are never exposed.
const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  Innlandet: { lat: 61.15, lng: 10.47 },
  Trøndelag: { lat: 63.43, lng: 10.9 },
  Vestfold: { lat: 59.27, lng: 10.2 },
  Rogaland: { lat: 58.97, lng: 5.73 },
  Viken: { lat: 59.9, lng: 11.1 },
  Oslo: { lat: 59.91, lng: 10.75 },
  Agder: { lat: 58.5, lng: 7.5 },
  "Møre og Romsdal": { lat: 62.7, lng: 7.2 },
  Nordland: { lat: 67.3, lng: 14.4 },
  "Troms og Finnmark": { lat: 69.6, lng: 18.9 },
  Vestland: { lat: 60.7, lng: 6.0 },
  Telemark: { lat: 59.4, lng: 8.7 },
};

const NORWAY_CENTER = { lat: 63.5, lng: 11.0 };

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 10000;
  return h;
}

/**
 * Returns an approximate, deterministic point for a listing based on its
 * region name and id — close enough to be useful, jittered enough (up to
 * roughly ±6km) that it never reveals a real address.
 */
export function approximateLocation(
  regionText: string,
  seedId: string
): { lat: number; lng: number } {
  const match = Object.keys(REGION_COORDS).find((r) =>
    regionText.toLowerCase().includes(r.toLowerCase())
  );
  const base = match ? REGION_COORDS[match] : NORWAY_CENTER;
  const seed = seedFromString(seedId);

  const jitterLat = ((seed % 100) / 100 - 0.5) * 0.12;
  const jitterLng = (((seed * 7) % 100) / 100 - 0.5) * 0.12;

  return { lat: base.lat + jitterLat, lng: base.lng + jitterLng };
}
