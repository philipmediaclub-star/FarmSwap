import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuySellResults from "@/components/BuySellResults";

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
