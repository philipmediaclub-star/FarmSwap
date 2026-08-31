"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { TextField, TextAreaField } from "./forms/SellForm";
import AvatarUploader from "./AvatarUploader";

export default function EditProfileForm() {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [fullName, setFullName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();
      if (profile) {
        setFullName(profile.full_name ?? "");
        setFarmName(profile.farm_name ?? "");
        setLocation(profile.location ?? "");
        setBio(profile.bio ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        farm_name: farmName || null,
        location: location || null,
        bio: bio || null,
        avatar_url: avatarUrl,
      })
      .eq("id", userId);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  }

  if (loading) {
    return <div className="mx-auto max-w-xl px-4 py-20 text-center text-ink/50">…</div>;
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center mx-auto">
          <Lock size={20} className="text-moss-dark" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          {t("post_login_required_title")}
        </h1>
        <Link
          href="/logg-inn"
          className="mt-6 inline-block bg-moss hover:bg-moss-dark text-paper font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {t("auth_go_login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl font-bold text-ink">{t("profile_edit_title")}</h1>
        <Link href={`/profil/${userId}`} className="text-sm font-semibold text-moss-dark hover:underline">
          {t("profile_view_public")}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <AvatarUploader userId={userId} url={avatarUrl} onChange={setAvatarUrl} />
        <TextField label={t("profile_edit_full_name")} value={fullName} onChange={setFullName} required />
        <TextField label={t("profile_edit_farm_name")} value={farmName} onChange={setFarmName} />
        <TextField label={t("profile_edit_location")} value={location} onChange={setLocation} />
        <TextAreaField label={t("profile_edit_bio")} value={bio} onChange={setBio} />

        {error && <p className="text-sm text-barn">{error}</p>}
        {saved && <p className="text-sm text-moss-dark">{t("profile_edit_saved")}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
        >
          {saving ? t("profile_edit_saving") : t("profile_edit_save")}
        </button>
      </form>
    </div>
  );
}
