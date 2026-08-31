"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto border-t border-steel-light bg-cream-card">
      <div className="furrow-divider" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-xl font-bold text-ink">Farm</span>
              <span className="font-display text-xl font-bold text-moss">Swap</span>
            </div>
            <p className="mt-2 text-sm text-ink/60 max-w-xs">{t("footer_tagline")}</p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <Link href="/vilkar" className="text-ink/70 hover:text-moss">
                {t("footer_terms")}
              </Link>
              <Link href="/personvern" className="text-ink/70 hover:text-moss">
                {t("footer_privacy")}
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-ink/45 font-tag">
          © {new Date().getFullYear()} FarmSwap. {t("footer_rights")}
        </p>
      </div>
    </footer>
  );
}
