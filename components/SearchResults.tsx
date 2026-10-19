"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { fetchListings } from "@/lib/data/listings";
import { fetchRentals } from "@/lib/data/rentals";
import { fetchServices } from "@/lib/data/services";
import { fetchJobs } from "@/lib/data/jobs";
import type { Listing } from "@/data/listings";
import type { RentalListing } from "@/data/rentals";
import type { ServiceListing } from "@/data/services";
import type { JobListing } from "@/data/jobs";
import ListingCard from "./ListingCard";
import RentalCard from "./RentalCard";
import ServiceCard from "./ServiceCard";
import JobCard from "./JobCard";

function norm(s: string | null | undefined) {
  return (s ?? "").toLowerCase();
}

/** Every word in the query must appear somewhere in the text. */
function matches(words: string[], ...fields: (string | null | undefined)[]) {
  if (words.length === 0) return true;
  const hay = fields.map(norm).join(" ");
  return words.every((w) => hay.includes(w));
}

export default function SearchResults({
  initialQuery,
  initialPlace,
}: {
  initialQuery: string;
  initialPlace: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [place, setPlace] = useState(initialPlace);
  const [listings, setListings] = useState<Listing[]>([]);
  const [rentals, setRentals] = useState<RentalListing[]>([]);
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchListings(), fetchRentals(), fetchServices(), fetchJobs()]).then(
      ([l, r, s, j]) => {
        setListings(l.listings);
        setRentals(r.rentals);
        setServices(s.services);
        setJobs(j.jobs);
        setLoading(false);
      }
    );
  }, []);

  // keep the URL in sync so the search can be shared / reloaded
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (place.trim()) params.set("sted", place.trim());
    router.replace(`/sok${params.toString() ? `?${params}` : ""}`);
  }

  const words = useMemo(() => norm(query).split(/\s+/).filter(Boolean), [query]);
  const placeWords = useMemo(() => norm(place).split(/\s+/).filter(Boolean), [place]);

  const r = useMemo(() => {
    const inPlace = (loc: string) => matches(placeWords, loc);
    return {
      listings: listings.filter(
        (l) => inPlace(l.location) && matches(words, l.title, l.category, l.location, l.condition, String(l.year ?? ""))
      ),
      rentals: rentals.filter(
        (x) => inPlace(x.location) && matches(words, x.title, x.category, x.description, x.location, x.conditions)
      ),
      services: services.filter(
        (x) => inPlace(x.location) && matches(words, x.title, x.category, x.description, x.location, x.providerName)
      ),
      jobs: jobs.filter(
        (x) => inPlace(x.location) && matches(words, x.title, x.description, x.location, x.skills, x.posterName)
      ),
    };
  }, [words, placeWords, listings, rentals, services, jobs]);

  const total = r.listings.length + r.rentals.length + r.services.length + r.jobs.length;

  const section = (title: string, count: number, children: React.ReactNode, grid: string) =>
    count > 0 && (
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">
          {title} <span className="text-ink/45 font-normal">({count})</span>
        </h2>
        <div className={`mt-4 grid gap-4 ${grid}`}>{children}</div>
      </section>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">{t("search_page_title")}</h1>

      <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-3xl">
        <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-cream-card border border-steel-light">
          <Search size={18} className="text-steel shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder={t("search_placeholder")}
            className="w-full bg-transparent outline-none text-ink placeholder:text-steel text-[15px]"
          />
        </label>
        <label className="sm:w-52 flex items-center gap-3 px-4 py-3 rounded-lg bg-cream-card border border-steel-light">
          <MapPin size={18} className="text-steel shrink-0" />
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            type="text"
            placeholder={t("search_location")}
            className="w-full bg-transparent outline-none text-ink placeholder:text-steel text-[15px]"
          />
        </label>
        <button type="submit" className="bg-moss hover:bg-moss-dark text-paper font-semibold px-6 py-3 rounded-lg">
          {t("search_button")}
        </button>
      </form>

      {!loading && (
        <p className="mt-4 text-sm text-ink/60">
          {query || place
            ? `${total} ${t("search_hits_for")} "${[query.trim(), place.trim()].filter(Boolean).join(" · ")}"`
            : `${total} ${t("search_hits_all")}`}
        </p>
      )}

      {loading ? null : total === 0 ? (
        <div className="mt-10 text-center py-16 border border-dashed border-steel-light rounded-xl">
          <p className="text-ink/60">{t("search_none")}</p>
        </div>
      ) : (
        <>
          {section(
            t("nav_buysell"),
            r.listings.length,
            r.listings.map((l) => <ListingCard key={l.id} listing={l} />),
            "grid-cols-2 lg:grid-cols-4"
          )}
          {section(
            t("nav_rent"),
            r.rentals.length,
            r.rentals.map((x) => <RentalCard key={x.id} listing={x} />),
            "grid-cols-2 lg:grid-cols-4"
          )}
          {section(
            t("nav_services"),
            r.services.length,
            r.services.map((x) => <ServiceCard key={x.id} service={x} />),
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
          {section(
            t("nav_jobs"),
            r.jobs.length,
            r.jobs.map((x) => <JobCard key={x.id} job={x} />),
            "grid-cols-1 md:grid-cols-2"
          )}
        </>
      )}
    </div>
  );
}
