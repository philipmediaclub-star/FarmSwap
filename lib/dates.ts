export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Expands confirmed booking ranges into a flat list of ISO dates. */
export function expandRanges(ranges: { start_date: string; end_date: string }[]): string[] {
  const out: string[] = [];
  for (const r of ranges) {
    const end = new Date(r.end_date + "T00:00:00");
    for (let d = new Date(r.start_date + "T00:00:00"); d <= end; d = addDays(d, 1)) {
      out.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    }
  }
  return out;
}
