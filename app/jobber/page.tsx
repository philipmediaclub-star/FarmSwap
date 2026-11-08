import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobsPageContent from "@/components/JobsPageContent";

export const metadata: Metadata = {
  title: "Jobber i landbruket",
  description: "Ledige stillinger og folk som søker jobb i landbruket – sesongarbeid, avløsning og mer.",
  alternates: { canonical: "/jobber" },
  openGraph: { title: "Jobber i landbruket", description: "Ledige stillinger og folk som søker jobb i landbruket – sesongarbeid, avløsning og mer.", url: "/jobber" },
};

export default function JobsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <JobsPageContent />
      </main>
      <Footer />
    </>
  );
}
