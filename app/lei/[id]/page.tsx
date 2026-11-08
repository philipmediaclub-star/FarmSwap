import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { RentalListing } from "@/data/rentals";
import { expandRanges } from "@/lib/dates";
import RentalDetailContent from "@/components/RentalDetailContent";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { truncate, jsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("rentals")
    .select("title, daily_price, category, location, description, image_urls")
    .eq("id", id)
    .single();
  if (!data) return { title: "Annonse ikke funnet", robots: { index: false } };

  const title = `Lei ${data.title}${data.location ? ` i ${data.location}` : ""}`;
  const description = truncate(
    `${data.title} til leie fra ${Number(data.daily_price).toLocaleString("nb-NO")} kr per dag. ${data.description ?? ""}`
  );
  const image = data.image_urls?.[0];
  return {
    title,
    description,
    alternates: { canonical: `/lei/${id}` },
    openGraph: { type: "website", title, description, url: `/lei/${id}`, ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing: RentalListing | undefined;
  let ownerId: string | null = null;

  {
    const supabase = await createClient();
    const { data } = await supabase
      .from("rentals")
      .select("*, profiles(full_name)")
      .eq("id", id)
      .single();

    const { data: booked } = await supabase.rpc("rental_booked_dates", { p_rental: id });

    if (data) {
      ownerId = data.owner_id;
      listing = {
        id: data.id,
        title: data.title,
        dailyPrice: Number(data.daily_price),
        weeklyPrice: Number(data.weekly_price ?? data.daily_price * 5),
        category: data.category,
        location: data.location,
        distanceKm: 0,
        owner: data.profiles?.full_name ?? "Ukjent bruker",
        description: data.description ?? "",
        conditions: data.conditions ?? "",
        imageQuery: data.image_urls?.[0] ?? data.title,
        imageUrls: data.image_urls ?? [],
        unavailableDates: expandRanges((booked as { start_date: string; end_date: string }[]) ?? []),
      };
    }
  }

  if (!listing) notFound();

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: listing.title,
            description: truncate(listing.description, 500),
            category: listing.category,
            ...(listing.imageUrls?.length ? { image: listing.imageUrls } : {}),
            offers: {
              "@type": "Offer",
              price: listing.dailyPrice,
              priceCurrency: "NOK",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/lei/${listing.id}`,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: listing.dailyPrice,
                priceCurrency: "NOK",
                unitCode: "DAY",
              },
            },
          }),
        }}
      />
      <main className="flex-1">
        <RentalDetailContent listing={listing} ownerId={ownerId} />
      </main>
      <Footer />
    </>
  );
}
