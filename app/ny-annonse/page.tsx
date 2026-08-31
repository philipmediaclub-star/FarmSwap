import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostListingFlow from "@/components/PostListingFlow";

export default function PostListingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PostListingFlow />
      </main>
      <Footer />
    </>
  );
}
