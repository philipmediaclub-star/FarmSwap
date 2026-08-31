"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

const links = [
  { key: "nav_home", href: "/" },
  { key: "nav_buysell", href: "/kjop-og-selg" },
  { key: "nav_rent", href: "/lei" },
  { key: "nav_services", href: "/tjenester" },
  { key: "nav_jobs", href: "/jobber" },
  { key: "nav_map", href: "/kart" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function loadUnread(uid: string) {
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant_a.eq.${uid},participant_b.eq.${uid}`);

      const ids = (convos ?? []).map((c) => c.id);
      if (ids.length === 0) {
        setUnreadCount(0);
        return;
      }

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids)
        .eq("read", false)
        .neq("sender_id", uid);

      setUnreadCount(count ?? 0);
    }

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) loadUnread(uid);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user.id ?? null;
      setUserId(uid);
      if (uid) loadUnread(uid);
      else setUnreadCount(0);
    });

    // Refresh the count whenever a new message arrives anywhere for this user.
    const channel = supabase
      .channel("navbar-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) loadUnread(data.user.id);
        });
      })
      .subscribe();

    return () => {
      listener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-steel-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-baseline gap-0.5 group">
            <span className="font-display text-2xl font-bold tracking-tight text-ink">
              Farm
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-moss">
              Swap
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-ink/80 hover:text-moss rounded-md transition-colors"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "no" ? "en" : "no")}
              aria-label="Bytt språk / Switch language"
              className="text-xs font-tag font-medium px-2 py-1.5 rounded border border-steel-light text-steel hover:border-moss hover:text-moss transition-colors"
            >
              {lang === "no" ? "NO / EN" : "EN / NO"}
            </button>
            <Link
              href="/ny-annonse"
              className="text-sm font-semibold text-moss-dark border border-moss/30 px-3.5 py-2 rounded-md hover:bg-sage/50 transition-colors"
            >
              {t("post_listing")}
            </Link>
            {userId === undefined ? null : userId ? (
              <>
                <Link
                  href="/dashbord"
                  className="text-sm font-medium text-ink/80 hover:text-moss px-3 py-2"
                >
                  {t("nav_dashboard")}
                </Link>
                <Link
                  href="/meldinger"
                  className="relative text-sm font-medium text-ink/80 hover:text-moss px-3 py-2"
                >
                  {t("nav_messages")}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-barn text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/profil/${userId}`}
                  className="text-sm font-medium text-ink/80 hover:text-moss px-3 py-2"
                >
                  {t("nav_my_profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-ink/70 border border-steel-light px-4 py-2 rounded-md hover:bg-sage/30 transition-colors"
                >
                  {t("nav_logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/logg-inn"
                  className="text-sm font-medium text-ink/80 hover:text-moss px-3 py-2"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/opprett-konto"
                  className="text-sm font-semibold bg-moss text-paper px-4 py-2 rounded-md hover:bg-moss-dark transition-colors"
                >
                  {t("nav_signup")}
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-ink"
            onClick={() => setOpen(!open)}
            aria-label="Åpne meny"
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-steel-light bg-paper">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-2 py-3 text-base font-medium text-ink border-b border-steel-light/60 last:border-b-0"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3">
              {userId === undefined ? null : userId ? (
                <>
                  <Link
                    href="/dashbord"
                    onClick={() => setOpen(false)}
                    className="text-center text-sm font-medium border border-steel-light rounded-md py-2.5"
                  >
                    {t("nav_dashboard")}
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      href="/meldinger"
                      onClick={() => setOpen(false)}
                      className="relative flex-1 text-center text-sm font-medium border border-steel-light rounded-md py-2.5"
                    >
                      {t("nav_messages")}
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1/4 min-w-[18px] h-[18px] px-1 rounded-full bg-barn text-white text-[10px] font-bold flex items-center justify-center leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href={`/profil/${userId}`}
                      onClick={() => setOpen(false)}
                      className="flex-1 text-center text-sm font-medium border border-steel-light rounded-md py-2.5"
                    >
                      {t("nav_my_profile")}
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-center text-sm font-semibold bg-ink/5 text-ink/70 rounded-md py-2.5"
                  >
                    {t("nav_logout")}
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/logg-inn"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center text-sm font-medium border border-steel-light rounded-md py-2.5"
                  >
                    {t("nav_login")}
                  </Link>
                  <Link
                    href="/opprett-konto"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center text-sm font-semibold bg-moss text-paper rounded-md py-2.5"
                  >
                    {t("nav_signup")}
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/ny-annonse"
              onClick={() => setOpen(false)}
              className="mt-2 text-center text-sm font-semibold text-moss-dark border border-moss/30 rounded-md py-2.5"
            >
              {t("post_listing")}
            </Link>
            <button
              onClick={() => setLang(lang === "no" ? "en" : "no")}
              className="mt-2 text-xs font-tag text-steel self-start"
            >
              {lang === "no" ? "Switch to English" : "Bytt til norsk"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
