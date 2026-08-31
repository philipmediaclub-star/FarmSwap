"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || t("auth_error_generic"));
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 sm:px-6 py-14 sm:py-20">
          <h1 className="font-display text-3xl font-bold text-ink">
            {t("auth_login_title")}
          </h1>
          <p className="mt-2 text-ink/65">{t("auth_login_subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink/80">{t("auth_email")}</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink/80">{t("auth_password")}</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm"
              />
            </label>

            {error && <p className="text-sm text-barn">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? t("auth_submitting") : t("auth_submit_login")}
            </button>

            <p className="text-sm text-ink/60 text-center mt-2">
              {t("auth_no_account")}{" "}
              <Link href="/opprett-konto" className="text-moss-dark font-semibold hover:underline">
                {t("auth_go_signup")}
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
