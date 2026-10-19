"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import PhotoUploader from "@/components/PhotoUploader";
import { TextField, TextAreaField, SelectField } from "./SellForm";
import { geocodeLocation } from "@/lib/geocode";
import { useCategories } from "@/lib/categories";


export default function RentForm({
  userId,
  editId,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial,
}: {
  userId: string;
  editId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: Record<string, any>;
}) {
  const { t } = useLanguage();
  const categories = useCategories("rent");
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dailyPrice, setDailyPrice] = useState(initial?.daily_price != null ? String(initial.daily_price) : "");
  const [weeklyPrice, setWeeklyPrice] = useState(initial?.weekly_price != null ? String(initial.weekly_price) : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [conditions, setConditions] = useState(initial?.conditions ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [photos, setPhotos] = useState<string[]>(initial?.image_urls ?? []);
  const [postalCode, setPostalCode] = useState("");
  const [zipError, setZipError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Postal code -> city lookup, so the ad gets an accurate position for "equipment nearby".
  async function handleZip(value: string) {
    const zip = value.replace(/\D/g, "").slice(0, 4);
    setPostalCode(zip);
    setZipError(false);
    if (zip.length < 4) return;
    const { data } = await createClient().from("postal_codes").select("city").eq("zip", zip).maybeSingle();
    if (data?.city) setLocation(data.city);
    else setZipError(true);
  }

  // New ads start from the postal code on the user's profile.
  useEffect(() => {
    if (editId) return;
    createClient()
      .from("profiles")
      .select("postal_code, city")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.postal_code && data?.city) {
          setPostalCode(data.postal_code);
          setLocation(data.city);
        }
      });
  }, [editId, userId]);

  const categoryValue = category || categories[0];
  const categoryOptions = categories.includes(categoryValue) ? categories : [categoryValue, ...categories];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const chosenCategory = categoryValue;

    const supabase = createClient();
    const coords = await geocodeLocation(postalCode.length === 4 ? `${postalCode} ${location}` : location);

    const fields = {
        title,
        description,
        daily_price: Number(dailyPrice),
        weekly_price: weeklyPrice ? Number(weeklyPrice) : null,
        category: chosenCategory,
        conditions,
        location,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        image_urls: photos,
    };
    const { data, error: insertError } = editId
      ? await supabase.from("rentals").update(fields).eq("id", editId).select().single()
      : await supabase.from("rentals").insert({ owner_id: userId, ...fields }).select().single();

    setSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message ?? t("auth_error_generic"));
      return;
    }

    router.push(`/lei/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-ink">{editId ? t("edit_title") : t("post_choose_rent")}</h1>

      <TextField label={t("post_field_title")} value={title} onChange={setTitle} required />
      <TextAreaField label={t("post_field_description")} value={description} onChange={setDescription} />

      <div className="grid grid-cols-2 gap-4">
        <TextField label={t("post_field_daily_price")} value={dailyPrice} onChange={setDailyPrice} type="number" required />
        <TextField label={t("post_field_weekly_price")} value={weeklyPrice} onChange={setWeeklyPrice} type="number" />
      </div>

      <SelectField label={t("post_field_category")} value={categoryValue} onChange={setCategory} options={categoryOptions} />
      <TextAreaField label={t("post_field_conditions")} value={conditions} onChange={setConditions} />
      <div className="grid grid-cols-3 gap-4">
        <TextField label={t("profile_edit_zip")} value={postalCode} onChange={handleZip} />
        <div className="col-span-2">
          <TextField label={t("post_field_location")} value={location} onChange={setLocation} required />
        </div>
      </div>
      {zipError && <p className="-mt-3 text-xs text-barn">{t("profile_zip_unknown")}</p>}

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
        {submitting ? t("post_submitting") : editId ? t("edit_save") : t("post_submit_rent")}
      </button>
    </form>
  );
}
