import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RentPageContent from "@/components/RentPageContent";

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
