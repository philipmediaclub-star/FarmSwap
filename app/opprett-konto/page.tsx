"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

function isAtLeast16(dob: string) {
  const birth = new Date(dob);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 16);
  return birth <= cutoff;
}

export default function SignupPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isAtLeast16(dob)) {
      setError(t("auth_error_age"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          date_of_birth: dob,
          farm_name: farmName || null,
          location: location || null,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || t("auth_error_generic"));
      return;
    }
    setSuccess(true);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 sm:px-6 py-14 sm:py-20">
          <h1 className="font-display text-3xl font-bold text-ink">
            {t("auth_signup_title")}
          </h1>
          <p className="mt-2 text-ink/65">{t("auth_signup_subtitle")}</p>

          {success ? (
            <div className="mt-8 bg-sage/50 border border-moss/20 rounded-xl p-6 text-center">
              <CheckCircle2 size={36} className="text-moss mx-auto" />
              <h2 className="mt-3 font-display font-semibold text-ink">
                {t("auth_signup_success_title")}
              </h2>
              <p className="mt-2 text-sm text-ink/65">{t("auth_signup_success_body")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Field label={t("auth_full_name")}>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label={t("auth_email")}>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label={t("auth_password")}>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label={t("auth_dob")} hint={t("auth_dob_hint")}>
                <input
                  required
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label={t("auth_farm_name")}>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label={t("auth_location")}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input"
                />
              </Field>

              {error && <p className="text-sm text-barn">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? t("auth_submitting") : t("auth_submit_signup")}
              </button>

              <p className="text-sm text-ink/60 text-center mt-2">
                {t("auth_have_account")}{" "}
                <Link href="/logg-inn" className="text-moss-dark font-semibold hover:underline">
                  {t("auth_go_login")}
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        .input {
          padding: 0.65rem 0.9rem;
          border-radius: 0.5rem;
          background: var(--color-cream-card);
          border: 1px solid var(--color-steel-light);
          outline: none;
          font-size: 0.9rem;
        }
        .input:focus {
          border-color: var(--color-moss);
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink/50">{hint}</span>}
    </label>
  );
}
