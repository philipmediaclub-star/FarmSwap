import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesPageContent from "@/components/ServicesPageContent";

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
