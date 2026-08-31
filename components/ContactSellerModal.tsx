"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function ContactSellerModal({
  open,
  onClose,
  sellerId,
  listingId,
  buttonLabel,
}: {
  open: boolean;
  onClose: () => void;
  /** real seller/owner profile id, or null for demo/mock listings */
  sellerId: string | null;
  listingId: string;
  buttonLabel: string;
}) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !sellerId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [open, sellerId]);

  if (!open) return null;

  function handleClose() {
    setSent(false);
    setError(null);
    setMessage("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!sellerId) {
      setSending(true);
      setTimeout(() => {
        setSending(false);
        setSent(true);
      }, 600);
      return;
    }

    if (!userId) return;

    setSending(true);
    const supabase = createClient();

    // Find or create the conversation between these two users for this listing.
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_a", userId)
      .eq("participant_b", sellerId)
      .eq("related_listing_id", listingId)
      .maybeSingle();

    let conversationId = existing?.id;

    if (!conversationId) {
      const { data: created, error: createError } = await supabase
        .from("conversations")
        .insert({
          participant_a: userId,
          participant_b: sellerId,
          related_listing_id: listingId,
        })
        .select()
        .single();

      if (createError || !created) {
        setSending(false);
        setError(createError?.message ?? t("auth_error_generic"));
        return;
      }
      conversationId = created.id;
    }

    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: message,
    });

    setSending(false);

    if (msgError) {
      setError(msgError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-paper w-full sm:max-w-md sm:rounded-xl rounded-t-2xl p-6 relative"
      >
        <button
          onClick={handleClose}
          aria-label={t("rent_close")}
          className="absolute top-4 right-4 text-ink/50 hover:text-ink"
        >
          <X size={20} />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-moss mx-auto" />
            <h3 className="mt-4 font-display text-xl font-bold text-ink">
              {t("contact_sent_title")}
            </h3>
            <p className="mt-2 text-sm text-ink/65 leading-relaxed">{t("contact_sent_body")}</p>
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-moss hover:bg-moss-dark text-paper font-semibold py-3 rounded-lg transition-colors"
            >
              {t("rent_close")}
            </button>
          </div>
        ) : sellerId && userId === null ? (
          <div className="text-center py-6">
            <Lock size={32} className="text-moss mx-auto" />
            <p className="mt-3 text-sm text-ink/70">{t("contact_login_required")}</p>
            <Link
              href="/logg-inn"
              className="mt-5 inline-block bg-moss hover:bg-moss-dark text-paper font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              {t("auth_go_login")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h3 className="font-display text-xl font-bold text-ink pr-6">{buttonLabel}</h3>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t("contact_form_message")}
              className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm resize-none"
            />
            {error && <p className="text-sm text-barn">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
            >
              {sending ? t("contact_sending") : t("contact_form_send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
