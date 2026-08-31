"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

function formatNOK(n: number) {
  return new Intl.NumberFormat("nb-NO").format(n) + " kr";
}

export default function ReservationModal({
  open,
  onClose,
  ownerName,
  totalPrice,
  dayCount,
  rentalId,
  range,
}: {
  open: boolean;
  onClose: () => void;
  ownerName: string;
  totalPrice: number;
  dayCount: number;
  /** real Supabase rental id, or null for demo/mock listings */
  rentalId: string | null;
  range: { start: string; end: string } | null;
}) {
  const { t } = useLanguage();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open || !rentalId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [open, rentalId]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!rentalId) {
      // Demo/mock listing — simulate only, nothing to store.
      setSending(true);
      setTimeout(() => {
        setSending(false);
        setSent(true);
      }, 700);
      return;
    }

    if (!userId || !range) return;

    setSending(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("reservations").insert({
      rental_id: rentalId,
      requester_id: userId,
      start_date: range.start,
      end_date: range.end,
      message: message || null,
    });
    setSending(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSent(true);
  }

  function handleClose() {
    setSent(false);
    setError(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-paper w-full sm:max-w-md sm:rounded-xl rounded-t-2xl p-6 relative max-h-[90vh] overflow-y-auto"
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
              {t("rent_request_sent_title")}
            </h3>
            <p className="mt-2 text-sm text-ink/65 leading-relaxed">
              {t("rent_request_sent_body").replace("{owner}", ownerName)}
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-moss hover:bg-moss-dark text-paper font-semibold py-3 rounded-lg transition-colors"
            >
              {t("rent_close")}
            </button>
          </div>
        ) : rentalId && userId === null ? (
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
          <>
            <h3 className="font-display text-xl font-bold text-ink pr-6">
              {t("rent_reserve_button")}
            </h3>

            <div className="mt-3 bg-sage/50 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-ink/70">
                {dayCount} {t("rent_days_unit")}
              </span>
              <span className="font-tag font-semibold text-moss-dark">
                {formatNOK(totalPrice)}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              {!rentalId && (
                <>
                  <input
                    required
                    type="text"
                    placeholder={t("rent_form_name")}
                    className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
                  />
                  <input
                    required
                    type="tel"
                    placeholder={t("rent_form_phone")}
                    className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
                  />
                  <input
                    required
                    type="email"
                    placeholder={t("rent_form_email")}
                    className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
                  />
                </>
              )}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("rent_form_message")}
                rows={3}
                className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm resize-none"
              />

              {error && <p className="text-sm text-barn">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="mt-1 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
              >
                {sending ? t("rent_sending") : t("rent_send_request")}
              </button>

              <p className="text-xs text-ink/50 text-center leading-relaxed">
                {t("rent_prototype_note")}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
