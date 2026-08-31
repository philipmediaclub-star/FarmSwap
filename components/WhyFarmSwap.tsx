"use client";

import { PiggyBank, TrendingUp, Handshake } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const cards = [
  { icon: PiggyBank, titleKey: "why_card1_title", bodyKey: "why_card1_body" },
  { icon: TrendingUp, titleKey: "why_card2_title", bodyKey: "why_card2_body" },
  { icon: Handshake, titleKey: "why_card3_title", bodyKey: "why_card3_body" },
] as const;

export default function WhyFarmSwap() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-tag text-xs uppercase tracking-widest text-moss font-semibold">
          {t("why_eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink leading-tight">
          {t("why_title")}
        </h2>
        <p className="mt-4 text-ink/70 text-base sm:text-lg leading-relaxed">
          {t("why_body")}
        </p>
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div
            key={titleKey}
            className="bg-sage/60 rounded-xl p-6 border border-steel-light/60"
          >
            <Icon size={22} className="text-moss-dark" />
            <h3 className="mt-4 font-display font-semibold text-ink text-lg">
              {t(titleKey)}
            </h3>
            <p className="mt-2 text-sm text-ink/65 leading-relaxed">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
