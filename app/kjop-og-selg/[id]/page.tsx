import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import ListingDetailContent, { type FullListing } from "@/components/ListingDetailContent";
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
    .from("listings")
    .select("title, price, category, location, description, image_urls")
    .eq("id", id)
    .single();
  if (!data) return { title: "Annonse ikke funnet", robots: { index: false } };

  const title = `${data.title} – ${data.category} til salgs${data.location ? ` i ${data.location}` : ""}`;
  const description = truncate(
    `${data.title} for ${Number(data.price).toLocaleString("nb-NO")} kr. ${data.description ?? ""}`
  );
  const image = data.image_urls?.[0];
  return {
    title,
    description,
    alternates: { canonical: `/kjop-og-selg/${id}` },
    openGraph: { type: "website", title, description, url: `/kjop-og-selg/${id}`, ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing: FullListing | undefined;

  {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select("*, profiles(full_name)")
      .eq("id", id)
      .single();

    if (data) {
      listing = {
        id: data.id,
        title: data.title,
        price: Number(data.price),
        currency: "NOK",
        category: data.category,
        location: data.location,
        distanceKm: 0,
        year: data.year ?? undefined,
        hours: data.hours ?? undefined,
        condition: data.condition ?? undefined,
        imageQuery: data.title,
        sellerName: data.profiles?.full_name ?? "Ukjent bruker",
        description: data.description ?? "",
        imageUrls: data.image_urls ?? [],
        sellerId: data.seller_id,
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
              price: listing.price,
              priceCurrency: "NOK",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/kjop-og-selg/${listing.id}`,
            },
          }),
        }}
      />
      <main className="flex-1">
        <ListingDetailContent listing={listing} />
      </main>
      <Footer />
    </>
  );
}
