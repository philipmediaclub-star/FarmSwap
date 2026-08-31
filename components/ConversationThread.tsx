"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ConversationThread({ conversationId }: { conversationId: string }) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;

      const { data: convo } = await supabase
        .from("conversations")
        .select(
          "participant_a, participant_b, a:profiles!conversations_participant_a_fkey(full_name), b:profiles!conversations_participant_b_fkey(full_name)"
        )
        .eq("id", conversationId)
        .single();

      if (convo) {
        const c = convo as unknown as {
          participant_a: string;
          participant_b: string;
          a: { full_name: string } | null;
          b: { full_name: string } | null;
        };
        setOtherName((c.participant_a === uid ? c.b?.full_name : c.a?.full_name) ?? "");
      }

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(msgs ?? []);

      // Mark the other person's messages as read now that this conversation is open.
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", uid)
        .eq("read", false);

      channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();
    }

    load();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !userId) return;
    setSending(true);

    const supabase = createClient();
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: draft.trim(),
    });

    setDraft("");
    setSending(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col h-[calc(100vh-64px)]">
      <Link
        href="/meldinger"
        className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-moss-dark mb-4 shrink-0"
      >
        <ArrowLeft size={16} />
        {t("messages_back")}
      </Link>

      <h1 className="font-display text-xl font-bold text-ink shrink-0">
        {t("messages_conversation_with")} {otherName}
      </h1>

      <div className="mt-4 flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div
              key={m.id}
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                mine
                  ? "self-end bg-moss text-paper rounded-br-sm"
                  : "self-start bg-cream-card border border-steel-light text-ink rounded-bl-sm"
              }`}
            >
              {m.body}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2 shrink-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("messages_send_placeholder")}
          className="flex-1 px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label={t("messages_send_button")}
          className="w-11 h-11 rounded-lg bg-moss hover:bg-moss-dark disabled:opacity-50 text-paper flex items-center justify-center transition-colors"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
