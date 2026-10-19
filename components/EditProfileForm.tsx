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
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [zipStatus, setZipStatus] = useState<"idle" | "ok" | "unknown">("idle");
  const [oldLocation, setOldLocation] = useState<string | null>(null);
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
        setPostalCode(profile.postal_code ?? "");
        setCity(profile.city ?? "");
        setZipStatus(profile.postal_code && profile.city ? "ok" : "idle");
        setOldLocation(profile.location ?? null);
        setBio(profile.bio ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
      }
      const { data: addr } = await supabase
        .from("profile_addresses")
        .select("street")
        .eq("user_id", uid)
        .maybeSingle();
      setStreet(addr?.street ?? "");
      setLoading(false);
    });
  }, []);

  // Look the city up from the postal code as soon as 4 digits are entered.
  async function handleZipChange(value: string) {
    const zip = value.replace(/\D/g, "").slice(0, 4);
    setPostalCode(zip);
    if (zip.length < 4) {
      setCity("");
      setZipStatus("idle");
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("postal_codes").select("city").eq("zip", zip).maybeSingle();
    if (data?.city) {
      setCity(data.city);
      setZipStatus("ok");
    } else {
      setCity("");
      setZipStatus("unknown");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (postalCode && zipStatus !== "ok") {
      setError(t("profile_zip_unknown"));
      return;
    }
    setSaving(true);
    setSaved(false);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        farm_name: farmName || null,
        postal_code: postalCode || null,
        city: city || null,
        location: city || oldLocation,
        bio: bio || null,
        avatar_url: avatarUrl,
      })
      .eq("id", userId);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    const { error: addrError } = await supabase
      .from("profile_addresses")
      .upsert({ user_id: userId, street: street || null, updated_at: new Date().toISOString() });

    try {
      localStorage.removeItem("farmswap_origin");
    } catch {}

    setSaving(false);
    if (addrError) {
      setError(addrError.message);
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
        <TextField label={t("profile_edit_street")} value={street} onChange={setStreet} />
        <p className="-mt-3 text-xs text-ink/50">{t("profile_street_private")}</p>
        <div className="grid grid-cols-3 gap-4">
          <TextField label={t("profile_edit_zip")} value={postalCode} onChange={handleZipChange} />
          <div className="col-span-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink/80">{t("profile_edit_city")}</span>
              <input
                readOnly
                tabIndex={-1}
                value={city}
                className="px-3.5 py-2.5 rounded-lg bg-sage/30 border border-steel-light text-sm text-ink/70"
              />
            </label>
          </div>
        </div>
        {zipStatus === "unknown" && <p className="-mt-3 text-xs text-barn">{t("profile_zip_unknown")}</p>}
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
