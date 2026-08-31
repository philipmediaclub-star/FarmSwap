"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Lock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  rating: number;
  body: string | null;
  reviewer: { full_name: string } | null;
};

export default function ItemReviewSection({
  listingType,
  listingId,
}: {
  listingType: "listing" | "rental" | "service" | "job";
  listingId: string;
}) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from("listing_reviews")
      .select("id, rating, body, reviewer:profiles!listing_reviews_reviewer_id_fkey(full_name)")
      .eq("listing_type", listingType)
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as unknown as Review[]) ?? []));
  }, [listingType, listingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSending(true);

    const supabase = createClient();
    const { error } = await supabase.from("listing_reviews").insert({
      listing_type: listingType,
      listing_id: listingId,
      reviewer_id: userId,
      rating,
      body: body || null,
    });

    setSending(false);
    if (!error) setSent(true);
  }

  return (
    <div className="mt-8 pt-6 border-t border-steel-light">
      <h2 className="font-display font-semibold text-ink">{t("listing_reviews_title")}</h2>

      <div className="mt-3 flex flex-col gap-2">
        {reviews.map((r) => (
          <div key={r.id} className="bg-cream-card border border-steel-light rounded-lg p-3.5">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < r.rating ? "fill-barn text-barn" : "text-steel-light"} />
                ))}
              </div>
              <span className="text-xs text-ink/50">{r.reviewer?.full_name}</span>
            </div>
            {r.body && <p className="mt-1.5 text-sm text-ink/70">{r.body}</p>}
          </div>
        ))}
      </div>

      <div className="mt-4">
        {userId === undefined ? null : sent ? (
          <div className="flex items-center gap-2 text-sm text-moss-dark">
            <CheckCircle2 size={16} /> {t("profile_review_sent")}
          </div>
        ) : userId === null ? (
          <div className="flex items-center gap-3 bg-sage/40 rounded-lg px-4 py-3.5">
            <Lock size={16} className="text-moss-dark shrink-0" />
            <p className="text-sm text-ink/70">
              {t("profile_review_login_required")}{" "}
              <Link href="/logg-inn" className="font-semibold text-moss-dark hover:underline">
                {t("auth_go_login")}
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-cream-card border border-steel-light rounded-lg p-4">
            <p className="text-xs text-ink/55">{t("listing_review_rate_prompt")}</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stjerner`}>
                  <Star size={20} className={n <= rating ? "fill-barn text-barn" : "text-steel-light"} />
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
            <button
              type="submit"
              disabled={sending}
              className="mt-3 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              {sending ? t("profile_review_sending") : t("profile_review_submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
