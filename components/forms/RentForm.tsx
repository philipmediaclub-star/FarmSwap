"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import PhotoUploader from "@/components/PhotoUploader";
import { TextField, TextAreaField, SelectField } from "./SellForm";

const categories = ["Redskap", "Såmaskin", "Tilhenger", "Vintervedlikehold", "Annet"];

export default function RentForm({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [conditions, setConditions] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("rentals")
      .insert({
        owner_id: userId,
        title,
        description,
        daily_price: Number(dailyPrice),
        weekly_price: weeklyPrice ? Number(weeklyPrice) : null,
        category,
        conditions,
        location,
        image_urls: photos,
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message ?? t("auth_error_generic"));
      return;
    }

    router.push(`/lei/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-ink">{t("post_choose_rent")}</h1>

      <TextField label={t("post_field_title")} value={title} onChange={setTitle} required />
      <TextAreaField label={t("post_field_description")} value={description} onChange={setDescription} />

      <div className="grid grid-cols-2 gap-4">
        <TextField label={t("post_field_daily_price")} value={dailyPrice} onChange={setDailyPrice} type="number" required />
        <TextField label={t("post_field_weekly_price")} value={weeklyPrice} onChange={setWeeklyPrice} type="number" />
      </div>

      <SelectField label={t("post_field_category")} value={category} onChange={setCategory} options={categories} />
      <TextAreaField label={t("post_field_conditions")} value={conditions} onChange={setConditions} />
      <TextField label={t("post_field_location")} value={location} onChange={setLocation} required />

      <div>
        <span className="text-sm font-medium text-ink/80">{t("post_field_photos")}</span>
        <div className="mt-1.5">
          <PhotoUploader userId={userId} pathPrefix="rentals" urls={photos} onChange={setPhotos} />
        </div>
      </div>

      {error && <p className="text-sm text-barn">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
      >
        {submitting ? t("post_submitting") : t("post_submit_rent")}
      </button>
    </form>
  );
}
