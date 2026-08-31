import Navbar from "@/components/Navbar";
import ConversationThread from "@/components/ConversationThread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ConversationThread conversationId={id} />
      </main>
    </>
  );
}
