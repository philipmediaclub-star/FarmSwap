import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobsPageContent from "@/components/JobsPageContent";

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
