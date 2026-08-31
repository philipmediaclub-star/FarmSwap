"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flag, X, CheckCircle2, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function ReportButton({
  listingType,
  listingId,
}: {
  listingType: "listing" | "rental" | "service" | "job";
  listingId: string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSending(true);

    const supabase = createClient();
    await supabase.from("reports").insert({
      reporter_id: userId,
      listing_type: listingType,
      listing_id: listingId,
      reason,
    });

    setSending(false);
    setSent(true);
  }

  function close() {
    setOpen(false);
    setSent(false);
    setReason("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-ink/45 hover:text-barn transition-colors"
      >
        <Flag size={12} />
        {t("report_button")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-paper w-full sm:max-w-sm sm:rounded-xl rounded-t-2xl p-6 relative"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-ink/50 hover:text-ink"
              aria-label="Lukk"
            >
              <X size={20} />
            </button>

            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 size={36} className="text-moss mx-auto" />
                <h3 className="mt-3 font-display font-semibold text-ink">
                  {t("report_sent_title")}
                </h3>
                <p className="mt-2 text-sm text-ink/65">{t("report_sent_body")}</p>
              </div>
            ) : userId === null ? (
              <div className="text-center py-4">
                <Lock size={28} className="text-moss mx-auto" />
                <p className="mt-3 text-sm text-ink/70">{t("report_login_required")}</p>
                <Link
                  href="/logg-inn"
                  className="mt-4 inline-block bg-moss hover:bg-moss-dark text-paper font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {t("auth_go_login")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h3 className="font-display font-semibold text-ink pr-6">{t("report_button")}</h3>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder={t("report_reason_placeholder")}
                  className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-barn hover:opacity-90 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-opacity text-sm"
                >
                  {sending ? t("report_sending") : t("report_submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
