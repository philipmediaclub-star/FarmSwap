"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { TextField, TextAreaField } from "./SellForm";

export default function JobForm({
  userId,
  editId,
  initial,
}: {
  userId: string;
  editId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: Record<string, any>;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [jobDate, setJobDate] = useState(initial?.job_date ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [payment, setPayment] = useState(initial?.payment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const fields = {
      title,
      description,
      location,
      job_date: jobDate || null,
      duration,
      payment,
    };
    const { error: insertError } = editId
      ? await supabase.from("jobs").update(fields).eq("id", editId)
      : await supabase.from("jobs").insert({ poster_id: userId, ...fields });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/jobber");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-ink">{editId ? t("edit_title") : t("post_choose_job")}</h1>

      <TextField label={t("post_field_title")} value={title} onChange={setTitle} required />
      <TextAreaField label={t("post_field_description")} value={description} onChange={setDescription} />
      <TextField label={t("post_field_location")} value={location} onChange={setLocation} required />

      <div className="grid grid-cols-2 gap-4">
        <TextField label={t("post_field_job_date")} value={jobDate} onChange={setJobDate} type="date" />
        <TextField label={t("post_field_duration")} value={duration} onChange={setDuration} />
      </div>

      <TextField label={t("post_field_payment")} value={payment} onChange={setPayment} />

      {error && <p className="text-sm text-barn">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
      >
        {submitting ? t("post_submitting") : editId ? t("edit_save") : t("post_submit_job")}
      </button>
    </form>
  );
}
