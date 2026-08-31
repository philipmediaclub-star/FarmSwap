"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type ConversationRow = {
  id: string;
  participant_a: string;
  participant_b: string;
  a: { full_name: string } | null;
  b: { full_name: string } | null;
};

type ConversationSummary = {
  id: string;
  otherName: string;
  lastMessage: string;
  lastAt: string;
};

export default function MessagesInbox() {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: convos } = await supabase
        .from("conversations")
        .select(
          "id, participant_a, participant_b, a:profiles!conversations_participant_a_fkey(full_name), b:profiles!conversations_participant_b_fkey(full_name)"
        )
        .or(`participant_a.eq.${uid},participant_b.eq.${uid}`)
        .order("created_at", { ascending: false });

      const rows = (convos ?? []) as unknown as ConversationRow[];

      const summaries = await Promise.all(
        rows.map(async (c) => {
          const otherName =
            c.participant_a === uid ? c.b?.full_name : c.a?.full_name;

          const { data: lastMsg } = await supabase
            .from("messages")
            .select("body, created_at")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: c.id,
            otherName: otherName ?? "Ukjent bruker",
            lastMessage: lastMsg?.body ?? "",
            lastAt: lastMsg?.created_at ?? "",
          };
        })
      );

      setConversations(summaries.sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1)));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-ink/50">…</div>;
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center mx-auto">
          <Lock size={20} className="text-moss-dark" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          {t("post_login_required_title")}
        </h1>
        <Link
          href="/logg-inn"
          className="mt-6 inline-block bg-moss hover:bg-moss-dark text-paper font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {t("auth_go_login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold text-ink">{t("messages_page_title")}</h1>

      {conversations.length === 0 ? (
        <p className="mt-8 text-sm text-ink/50">{t("messages_no_conversations")}</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/meldinger/${c.id}`}
              className="flex items-center gap-3 bg-cream-card border border-steel-light rounded-lg px-4 py-3.5 hover:border-moss/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-moss-dark" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink text-sm truncate">{c.otherName}</p>
                <p className="text-xs text-ink/55 truncate">{c.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
