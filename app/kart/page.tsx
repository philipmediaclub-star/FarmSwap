import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapPageContent from "@/components/MapPageContent";

export const metadata: Metadata = {
  title: "Kart over utstyr og annonser",
  description: "Se landbruksutstyr til salgs og utleie nær deg på kartet.",
  alternates: { canonical: "/kart" },
  openGraph: { title: "Kart over utstyr og annonser", description: "Se landbruksutstyr til salgs og utleie nær deg på kartet.", url: "/kart" },
};

export default function MapPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <MapPageContent />
      </main>
      <Footer />
    </>
  );
}
