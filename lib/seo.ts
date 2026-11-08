export function truncate(text: string | null | undefined, max = 155): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "…";
}

/** JSON for a <script type="application/ld+json"> tag, safe against "</script>" injection. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
