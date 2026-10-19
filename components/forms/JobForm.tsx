"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { TextField, TextAreaField } from "./SellForm";

type Kind = "offer" | "seeking";

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
  const [kind, setKind] = useState<Kind>(initial?.kind === "seeking" ? "seeking" : "offer");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [jobDate, setJobDate] = useState(initial?.job_date ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [payment, setPayment] = useState(initial?.payment ?? "");
  const [skills, setSkills] = useState(initial?.skills ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seeking = kind === "seeking";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const fields = {
      kind,
      title,
      description,
      location,
      job_date: jobDate || null,
      duration,
      payment,
      skills: skills || null,
    };
    const { error: saveError } = editId
      ? await supabase.from("jobs").update(fields).eq("id", editId)
      : await supabase.from("jobs").insert({ poster_id: userId, ...fields });

    setSubmitting(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    router.push("/jobber");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-ink">
        {editId ? t("edit_title") : t("post_choose_job")}
      </h1>

      <div>
        <span className="text-sm font-medium text-ink/80">{t("post_job_kind_label")}</span>
        <div className="mt-1.5 flex gap-2">
          {(["offer", "seeking"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border ${
                kind === k ? "bg-moss text-paper border-moss" : "border-steel-light text-ink/70"
              }`}
            >
              {k === "offer" ? t("post_job_kind_offer") : t("post_job_kind_seeking")}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-ink/50">
          {seeking ? t("post_job_kind_seeking_hint") : t("post_job_kind_offer_hint")}
        </p>
      </div>

      <TextField
        label={seeking ? t("post_job_title_seeking") : t("post_field_title")}
        value={title}
        onChange={setTitle}
        required
      />
      <TextAreaField
        label={seeking ? t("post_job_description_seeking") : t("post_field_description")}
        value={description}
        onChange={setDescription}
      />
      <TextAreaField
        label={seeking ? t("post_job_skills_seeking") : t("post_job_skills_offer")}
        value={skills}
        onChange={setSkills}
      />
      <TextField
        label={seeking ? t("post_job_location_seeking") : t("post_field_location")}
        value={location}
        onChange={setLocation}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label={seeking ? t("post_job_date_seeking") : t("post_field_job_date")}
          value={jobDate}
          onChange={setJobDate}
          type="date"
        />
        <TextField
          label={seeking ? t("post_job_duration_seeking") : t("post_field_duration")}
          value={duration}
          onChange={setDuration}
        />
      </div>

      <TextField
        label={seeking ? t("post_job_payment_seeking") : t("post_field_payment")}
        value={payment}
        onChange={setPayment}
      />

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
