import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardContent from "@/components/DashboardContent";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <DashboardContent />
      </main>
      <Footer />
    </>
  );
}
