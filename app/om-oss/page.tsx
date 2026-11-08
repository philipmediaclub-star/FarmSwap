import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "Om oss",
  description: "Les mer om FarmSwap og teamet bak markedsplassen for landbruket.",
  alternates: { canonical: "/om-oss" },
  openGraph: { title: "Om oss", description: "Les mer om FarmSwap og teamet bak markedsplassen for landbruket.", url: "/om-oss" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}
