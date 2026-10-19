"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function NewPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The reset link logs the user in with a temporary recovery session.
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecked(true);
    });
    const timer = setTimeout(() => setChecked(true), 1500);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError(t("auth_reset_short"));
    if (password !== confirm) return setError(t("auth_reset_mismatch"));
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message || t("auth_error_generic"));
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  const input =
    "px-3.5 py-2.5 rounded-lg bg-cream-card border border-steel-light outline-none focus:border-moss text-sm";

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 sm:px-6 py-14 sm:py-20">
          <h1 className="font-display text-3xl font-bold text-ink">{t("auth_reset_title")}</h1>

          {done ? (
            <p className="mt-8 text-sm text-ink/80 bg-cream-card border border-steel-light rounded-lg p-4">
              {t("auth_reset_done")}
            </p>
          ) : checked && !ready ? (
            <div className="mt-8">
              <p className="text-sm text-barn">{t("auth_reset_invalid")}</p>
              <Link href="/glemt-passord" className="text-sm text-moss-dark font-semibold hover:underline">
                {t("auth_forgot_submit")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink/80">{t("auth_reset_new")}</span>
                <input required type="password" minLength={8} value={password}
                  onChange={(e) => setPassword(e.target.value)} className={input} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink/80">{t("auth_reset_confirm")}</span>
                <input required type="password" minLength={8} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} className={input} />
              </label>
              {error && <p className="text-sm text-barn">{error}</p>}
              <button
                type="submit"
                disabled={loading || !ready}
                className="mt-2 bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? t("auth_submitting") : t("auth_reset_submit")}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
