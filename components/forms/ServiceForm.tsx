"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { TextField, TextAreaField, SelectField } from "./SellForm";

const categories = ["Leiekjøring", "Høsting", "Transport", "Snømåking", "Skogsarbeid", "Reparasjon", "Annet"];

export default function ServiceForm({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [priceType, setPriceType] = useState<"fixed" | "contact">("contact");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("services").insert({
      provider_id: userId,
      title,
      description,
      category,
      price_type: priceType,
      price: priceType === "fixed" && price ? Number(price) : null,
      location,
      availability,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/tjenester");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-ink">{t("post_choose_service")}</h1>

      <TextField label={t("post_field_title")} value={title} onChange={setTitle} required />
      <TextAreaField label={t("post_field_description")} value={description} onChange={setDescription} />
      <SelectField label={t("post_field_category")} value={category} onChange={setCategory} options={categories} />

      <div>
        <span className="text-sm font-medium text-ink/80">{t("post_field_price_type")}</span>
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => setPriceType("fixed")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border ${
              priceType === "fixed" ? "bg-moss text-paper border-moss" : "border-steel-light text-ink/70"
            }`}
          >
            {t("post_field_price_fixed")}
          </button>
          <button
            type="button"
            onClick={() => setPriceType("contact")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border ${
              priceType === "contact" ? "bg-moss text-paper border-moss" : "border-steel-light text-ink/70"
            }`}
          >
            {t("post_field_price_contact")}
          </button>
        </div>
      </div>

      {priceType === "fixed" && (
        <TextField label={t("post_field_price")} value={price} onChange={setPrice} type="number" />
      )}

      <TextField label={t("post_field_location")} value={location} onChange={setLocation} required />
      <TextField label={t("post_field_availability")} value={availability} onChange={setAvailability} />

      {error && <p className="text-sm text-barn">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
      >
        {submitting ? t("post_submitting") : t("post_submit_service")}
      </button>
    </form>
  );
}
