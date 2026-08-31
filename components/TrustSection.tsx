"use client";

import { Star, FileText, ShieldCheck, Flag, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function TrustSection() {
  const { t } = useLanguage();
  const liveItems = [
    { icon: Star, key: "trust_item1" },
    { icon: FileText, key: "trust_item2" },
    { icon: ShieldCheck, key: "trust_item3" },
    { icon: Flag, key: "trust_item4" },
  ] as const;
  const soonItems = ["trust_soon1", "trust_soon2"] as const;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-tag text-xs uppercase tracking-widest text-moss font-semibold">
          {t("trust_eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink leading-tight">
          {t("trust_title")}
        </h2>
        <p className="mt-4 text-ink/70 text-base sm:text-lg leading-relaxed">
          {t("trust_body")}
        </p>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-3xl">
        {liveItems.map(({ icon: Icon, key }) => (
          <div
            key={key}
            className="flex items-center gap-3 bg-cream-card border border-steel-light rounded-lg px-4 py-3.5"
          >
            <Icon size={18} className="text-moss-dark shrink-0" />
            <span className="text-sm font-medium text-ink">{t(key)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-3 max-w-3xl">
        {soonItems.map((key) => (
          <div
            key={key}
            className="flex items-center gap-3 border border-dashed border-steel-light rounded-lg px-4 py-3.5"
          >
            <Clock size={18} className="text-steel shrink-0" />
            <span className="text-sm font-medium text-steel">{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
