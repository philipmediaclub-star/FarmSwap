import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuySellResults from "@/components/BuySellResults";

export const metadata: Metadata = {
  title: "Kjøp og selg landbruksutstyr",
  description: "Finn traktorer, redskap, tilhengere og annet brukt landbruksutstyr til salgs. Legg ut din egen annonse gratis.",
  alternates: { canonical: "/kjop-og-selg" },
  openGraph: { title: "Kjøp og selg landbruksutstyr", description: "Finn traktorer, redskap, tilhengere og annet brukt landbruksutstyr til salgs. Legg ut din egen annonse gratis.", url: "/kjop-og-selg" },
};

export default async function BuySellPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <BuySellResults initialQuery={q ?? ""} />
      </main>
      <Footer />
    </>
  );
}
