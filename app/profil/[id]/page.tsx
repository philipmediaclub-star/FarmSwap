import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import ProfileContent from "@/components/ProfileContent";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: listings }, { data: rentals }, { data: services }, { data: jobs }, { data: reviews }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("listings").select("*").eq("seller_id", id).eq("status", "active"),
      supabase.from("rentals").select("*").eq("owner_id", id).eq("status", "active"),
      supabase.from("services").select("*").eq("provider_id", id).eq("status", "active"),
      supabase.from("jobs").select("*").eq("poster_id", id).eq("status", "active"),
      supabase.from("reviews").select("*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)").eq("reviewee_id", id),
    ]);

  if (!profile) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ProfileContent
          profile={profile}
          listings={listings ?? []}
          rentals={rentals ?? []}
          services={services ?? []}
          jobs={jobs ?? []}
          reviews={reviews ?? []}
        />
      </main>
      <Footer />
    </>
  );
}
