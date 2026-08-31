import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminContent from "@/components/AdminContent";

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AdminContent />
      </main>
      <Footer />
    </>
  );
}
