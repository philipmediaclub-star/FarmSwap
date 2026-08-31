export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
  return h;
}

/**
 * Deterministic per-listing "already booked" dates, always generated
 * relative to today so the calendar demo stays realistic no matter
 * when it's viewed.
 */
export function getUnavailableForListing(listingId: string): string[] {
  const seed = seedFromString(listingId);
  const today = new Date();
  const dates: string[] = [];

  const start1 = addDays(today, 3 + (seed % 5));
  for (let i = 0; i < 2; i++) dates.push(toISODate(addDays(start1, i)));

  const start2 = addDays(today, 14 + (seed % 7));
  for (let i = 0; i < 3; i++) dates.push(toISODate(addDays(start2, i)));

  return dates;
}
