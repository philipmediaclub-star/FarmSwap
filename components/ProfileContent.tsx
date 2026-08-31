"use client";

import { User, ShieldCheck, Star, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import ListingCard from "./ListingCard";
import RentalCard from "./RentalCard";
import ServiceCard from "./ServiceCard";
import JobCard from "./JobCard";
import ReviewForm from "./ReviewForm";
import type { Listing } from "@/data/listings";
import type { RentalListing } from "@/data/rentals";
import type { ServiceListing } from "@/data/services";
import type { JobListing } from "@/data/jobs";

type Profile = {
  id: string;
  full_name: string;
  farm_name: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  verified: boolean;
  created_at: string;
};

type Review = {
  id: string;
  rating: number;
  body: string | null;
  reviewer: { full_name: string } | null;
};

export default function ProfileContent({
  profile,
  listings,
  rentals,
  services,
  jobs,
  reviews,
}: {
  profile: Profile;
  listings: Record<string, unknown>[];
  rentals: Record<string, unknown>[];
  services: Record<string, unknown>[];
  jobs: Record<string, unknown>[];
  reviews: Review[];
}) {
  const { t } = useLanguage();
  const memberSince = new Date(profile.created_at).getFullYear();
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const listingCards: Listing[] = listings.map((l) => ({
    id: l.id as string,
    title: l.title as string,
    price: Number(l.price),
    currency: "NOK",
    category: l.category as string,
    location: l.location as string,
    distanceKm: 0,
    year: (l.year as number) ?? undefined,
    hours: (l.hours as number) ?? undefined,
    condition: l.condition as Listing["condition"],
    imageQuery: l.title as string,
    sellerName: profile.full_name,
  }));

  const rentalCards: RentalListing[] = rentals.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    dailyPrice: Number(r.daily_price),
    weeklyPrice: Number(r.weekly_price ?? Number(r.daily_price) * 5),
    category: r.category as string,
    location: r.location as string,
    distanceKm: 0,
    owner: profile.full_name,
    description: (r.description as string) ?? "",
    conditions: (r.conditions as string) ?? "",
    imageQuery: r.title as string,
    unavailableDates: [],
  }));

  const serviceCards: ServiceListing[] = services.map((s) => ({
    id: s.id as string,
    title: s.title as string,
    description: (s.description as string) ?? "",
    category: s.category as string,
    priceType: s.price_type as "fixed" | "contact",
    price: s.price !== null ? Number(s.price) : null,
    location: s.location as string,
    availability: (s.availability as string) ?? "",
    providerName: profile.full_name,
    providerId: profile.id,
  }));

  const jobCards: JobListing[] = jobs.map((j) => ({
    id: j.id as string,
    title: j.title as string,
    description: (j.description as string) ?? "",
    location: j.location as string,
    jobDate: (j.job_date as string) ?? null,
    duration: (j.duration as string) ?? "",
    payment: (j.payment as string) ?? "",
    posterName: profile.full_name,
    posterId: profile.id,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-16 h-16 rounded-full bg-sage flex items-center justify-center shrink-0 overflow-hidden">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <User size={28} className="text-moss-dark" />
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-ink">{profile.full_name}</h1>
            {profile.verified && (
              <span className="flex items-center gap-1 text-xs font-medium text-moss-dark bg-sage/60 px-2 py-1 rounded-full">
                <ShieldCheck size={13} /> {t("profile_verified_badge")}
              </span>
            )}
          </div>
          {profile.farm_name && <p className="text-ink/70 mt-0.5">{profile.farm_name}</p>}
          <div className="mt-1.5 flex items-center gap-3 flex-wrap text-sm text-ink/55">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {profile.location}
              </span>
            )}
            <span>{t("profile_member_since").replace("{year}", String(memberSince))}</span>
            {avgRating && (
              <span className="flex items-center gap-1">
                <Star size={13} className="fill-barn text-barn" /> {avgRating} ({reviews.length})
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm text-ink/70 leading-relaxed max-w-2xl">
        {profile.bio || t("profile_no_bio")}
      </p>

      {listingCards.length > 0 && (
        <Section title={t("profile_listings_title")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {listingCards.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </Section>
      )}

      {rentalCards.length > 0 && (
        <Section title={t("profile_rentals_title")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {rentalCards.map((r) => (
              <RentalCard key={r.id} listing={r} />
            ))}
          </div>
        </Section>
      )}

      {serviceCards.length > 0 && (
        <Section title={t("profile_services_title")}>
          <div className="grid sm:grid-cols-2 gap-4">
            {serviceCards.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </Section>
      )}

      {jobCards.length > 0 && (
        <Section title={t("profile_jobs_title")}>
          <div className="grid sm:grid-cols-2 gap-4">
            {jobCards.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </Section>
      )}

      <Section title={t("profile_reviews_title")}>
        <div className="flex flex-col gap-3">
          {reviews.length === 0 && <p className="text-sm text-ink/50">{t("profile_no_reviews")}</p>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-cream-card border border-steel-light rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < r.rating ? "fill-barn text-barn" : "text-steel-light"}
                    />
                  ))}
                </div>
                <span className="text-xs text-ink/50">{r.reviewer?.full_name}</span>
              </div>
              {r.body && <p className="mt-2 text-sm text-ink/70">{r.body}</p>}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <ReviewForm revieweeId={profile.id} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 pt-8 border-t border-steel-light">
      <h2 className="font-display font-semibold text-ink text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}
