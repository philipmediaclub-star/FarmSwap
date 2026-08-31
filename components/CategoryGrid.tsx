"use client";

import Link from "next/link";
import { Tractor, Repeat, Wrench, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const categories = [
  { icon: Tractor, titleKey: "cat_buysell_title", descKey: "cat_buysell_desc", href: "/kjop-og-selg" },
  { icon: Repeat, titleKey: "cat_rent_title", descKey: "cat_rent_desc", href: "/lei" },
  { icon: Wrench, titleKey: "cat_services_title", descKey: "cat_services_desc", href: "/tjenester" },
  { icon: Users, titleKey: "cat_jobs_title", descKey: "cat_jobs_desc", href: "/jobber" },
] as const;

export default function CategoryGrid() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {categories.map(({ icon: Icon, titleKey, descKey, href }) => (
          <Link
            key={titleKey}
            href={href}
            className="group bg-cream-card border border-steel-light rounded-xl p-5 hover:border-moss hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-sage flex items-center justify-center group-hover:bg-moss transition-colors">
              <Icon size={20} className="text-moss-dark group-hover:text-paper transition-colors" />
            </div>
            <h3 className="mt-3 font-display font-semibold text-ink text-[15px] sm:text-base">
              {t(titleKey)}
            </h3>
            <p className="mt-1 text-sm text-ink/60 leading-snug">{t(descKey)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
