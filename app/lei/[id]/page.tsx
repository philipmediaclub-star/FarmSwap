import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { rentalListings, type RentalListing } from "@/data/rentals";
import RentalDetailContent from "@/components/RentalDetailContent";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing: RentalListing | undefined = rentalListings.find((l) => l.id === id);
  let ownerId: string | null = null;

  if (!listing) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("rentals")
      .select("*, profiles(full_name)")
      .eq("id", id)
      .single();

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
        unavailableDates: [],
      };
    }
  }

  if (!listing) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <RentalDetailContent listing={listing} ownerId={ownerId} />
      </main>
      <Footer />
    </>
  );
}
