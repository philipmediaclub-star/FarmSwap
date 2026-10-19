// Promoted ("Reklame") ads. Only admins can set the dates (enforced in the database).

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Today's date as YYYY-MM-DD in the visitor's own timezone. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** True while today falls inside the promotion period (both dates inclusive). */
export function isPromotedNow(from?: string | null, until?: string | null): boolean {
  if (!from || !until) return false;
  const today = todayISO();
  return from <= today && today <= until;
}

type PromoRow = {
  promoted_from?: string | null;
  promoted_until?: string | null;
  created_at?: string | null;
};

/**
 * Orders rows: active promotions first (most recently started first),
 * then everything else, newest first.
 */
export function promotedFirst<T extends PromoRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const pa = isPromotedNow(a.promoted_from, a.promoted_until);
    const pb = isPromotedNow(b.promoted_from, b.promoted_until);
    if (pa !== pb) return pa ? -1 : 1;
    if (pa && pb) {
      const c = (b.promoted_from ?? "").localeCompare(a.promoted_from ?? "");
      if (c !== 0) return c;
    }
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
}
