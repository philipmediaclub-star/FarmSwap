"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Lock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({ revieweeId }: { revieweeId: string }) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  if (userId === undefined) return null;

  if (userId === null) {
    return (
      <div className="flex items-center gap-3 bg-sage/40 rounded-lg px-4 py-3.5">
        <Lock size={16} className="text-moss-dark shrink-0" />
        <p className="text-sm text-ink/70">
          {t("profile_review_login_required")}{" "}
          <Link href="/logg-inn" className="font-semibold text-moss-dark hover:underline">
            {t("auth_go_login")}
          </Link>
        </p>
      </div>
    );
  }

  if (userId === revieweeId) return null;

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-sm text-moss-dark">
        <CheckCircle2 size={16} /> {t("profile_review_sent")}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("reviews").insert({
      reviewer_id: userId,
      reviewee_id: revieweeId,
      rating,
      body: body || null,
    });

    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream-card border border-steel-light rounded-lg p-4">
      <p className="text-sm font-medium text-ink/80">{t("profile_review_rating")}</p>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} stjerner`}
          >
            <Star
              size={22}
              className={n <= rating ? "fill-barn text-barn" : "text-steel-light"}
            />
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder={t("profile_review_body")}
        className="mt-3 w-full px-3.5 py-2.5 rounded-lg bg-paper border border-steel-light outline-none focus:border-moss text-sm resize-none"
      />

      {error && <p className="mt-2 text-sm text-barn">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-3 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
      >
        {sending ? t("profile_review_sending") : t("profile_review_submit")}
      </button>
    </form>
  );
}
