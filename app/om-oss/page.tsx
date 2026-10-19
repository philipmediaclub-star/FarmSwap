import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";

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
