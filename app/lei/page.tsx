import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RentPageContent from "@/components/RentPageContent";

export const metadata: Metadata = {
  title: "Lei landbruksmaskiner",
  description: "Lei traktorer, maskiner og utstyr av andre bønder – eller tjen penger på å leie ut dine egne.",
  alternates: { canonical: "/lei" },
  openGraph: { title: "Lei landbruksmaskiner", description: "Lei traktorer, maskiner og utstyr av andre bønder – eller tjen penger på å leie ut dine egne.", url: "/lei" },
};

export default function RentPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <RentPageContent />
      </main>
      <Footer />
    </>
  );
}
