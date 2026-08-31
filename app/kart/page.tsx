import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapPageContent from "@/components/MapPageContent";

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
