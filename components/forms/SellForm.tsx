"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import PhotoUploader from "@/components/PhotoUploader";

const categories = ["Traktor", "Jordbruksutstyr", "Tilhenger", "Skurtresker", "Redskap", "Annet"];
const conditions = ["Ny", "Som ny", "Godt brukt", "Brukt"];

export default function SellForm({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [condition, setCondition] = useState(conditions[2]);
  const [year, setYear] = useState("");
  const [hours, setHours] = useState("");
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
      .from("listings")
      .insert({
        seller_id: userId,
        title,
        description,
        price: Number(price),
        category,
        condition,
        year: year ? Number(year) : null,
        hours: hours ? Number(hours) : null,
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

    router.push(`/kjop-og-selg/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-ink">{t("post_choose_sell")}</h1>

      <TextField label={t("post_field_title")} value={title} onChange={setTitle} required />
      <TextAreaField label={t("post_field_description")} value={description} onChange={setDescription} />
      <TextField label={t("post_field_price")} value={price} onChange={setPrice} type="number" required />

      <div className="grid grid-cols-2 gap-4">
        <SelectField label={t("post_field_category")} value={category} onChange={setCategory} options={categories} />
        <SelectField label={t("post_field_condition")} value={condition} onChange={setCondition} options={conditions} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField label={t("post_field_year")} value={year} onChange={setYear} type="number" />
        <TextField label={t("post_field_hours")} value={hours} onChange={setHours} type="number" />
      </div>

      <TextField label={t("post_field_location")} value={location} onChange={setLocation} required />

      <div>
        <span className="text-sm font-medium text-ink/80">{t("post_field_photos")}</span>
        <div className="mt-1.5">
          <PhotoUploader userId={userId} pathPrefix="listings" urls={photos} onChange={setPhotos} />
        </div>
      </div>

      {error && <p className="text-sm text-barn">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
      >
        {submitting ? t("post_submitting") : t("post_submit_sell")}
      </button>
    </form>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <textarea
        required={required}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm resize-none"
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
