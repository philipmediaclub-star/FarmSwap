import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessagesInbox from "@/components/MessagesInbox";

export default function MessagesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <MessagesInbox />
      </main>
      <Footer />
    </>
  );
}
