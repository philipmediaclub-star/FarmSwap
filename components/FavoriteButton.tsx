"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type FavoriteType = "listing" | "rental" | "service" | "job";

export default function FavoriteButton({ type, id }: { type: FavoriteType; id: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: fav } = await supabase
        .from("favorites")
        .select("user_id")
        .eq("user_id", uid)
        .eq("listing_type", type)
        .eq("listing_id", id)
        .maybeSingle();
      setSaved(!!fav);
    });
  }, [type, id]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || loading) return;
    setLoading(true);

    const supabase = createClient();
    if (saved) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_type", type)
        .eq("listing_id", id);
      setSaved(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: userId,
        listing_type: type,
        listing_id: id,
      });
      setSaved(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={!userId || loading}
      aria-label="Lagre annonse"
      aria-pressed={saved}
      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-paper/90 backdrop-blur flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40"
    >
      <Heart size={18} className={saved ? "fill-barn text-barn" : "text-ink/60"} />
    </button>
  );
}
