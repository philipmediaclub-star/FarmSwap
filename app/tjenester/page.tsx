import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesPageContent from "@/components/ServicesPageContent";

export const metadata: Metadata = {
  title: "Tjenester i landbruket",
  description: "Finn entreprenører, maskinførere og andre tjenester for gården – eller tilby dine egne.",
  alternates: { canonical: "/tjenester" },
  openGraph: { title: "Tjenester i landbruket", description: "Finn entreprenører, maskinførere og andre tjenester for gården – eller tilby dine egne.", url: "/tjenester" },
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ServicesPageContent />
      </main>
      <Footer />
    </>
  );
}
