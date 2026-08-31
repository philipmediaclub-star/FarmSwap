import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import WhyFarmSwap from "@/components/WhyFarmSwap";
import ListingsTeaser from "@/components/ListingsTeaser";
import TrustSection from "@/components/TrustSection";
import FurrowDivider from "@/components/FurrowDivider";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <FurrowDivider className="mt-16 sm:mt-24" />
        <WhyFarmSwap />
        <ListingsTeaser />
        <FurrowDivider />
        <TrustSection />
      </main>
      <Footer />
    </>
  );
}
