import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchResults from "@/components/SearchResults";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sted?: string }>;
}) {
  const { q, sted } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SearchResults initialQuery={q ?? ""} initialPlace={sted ?? ""} />
      </main>
      <Footer />
    </>
  );
}
