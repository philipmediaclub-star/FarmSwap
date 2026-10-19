import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import ListingDetailContent, { type FullListing } from "@/components/ListingDetailContent";
import { notFound } from "next/navigation";

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
      <main className="flex-1">
        <ListingDetailContent listing={listing} />
      </main>
      <Footer />
    </>
  );
}
