import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditProfileForm from "@/components/EditProfileForm";

export default function EditProfilePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <EditProfileForm />
      </main>
      <Footer />
    </>
  );
}
