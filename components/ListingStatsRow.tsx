"use client";

import { Eye, Heart, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function ListingStatsRow({
  views,
  favoriteCount,
  avgRating,
  ratingCount,
}: {
  views: number;
  favoriteCount: number;
  avgRating: number | null;
  ratingCount: number;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-4 text-xs text-ink/50">
      <span className="flex items-center gap-1">
        <Eye size={13} /> {views} {t("stats_views")}
      </span>
      <span className="flex items-center gap-1">
        <Heart size={13} /> {favoriteCount} {t("stats_favorites")}
      </span>
      {avgRating !== null ? (
        <span className="flex items-center gap-1">
          <Star size={13} className="fill-barn text-barn" /> {avgRating.toFixed(1)} ({ratingCount})
        </span>
      ) : (
        <span>{t("stats_no_ratings")}</span>
      )}
    </div>
  );
}
