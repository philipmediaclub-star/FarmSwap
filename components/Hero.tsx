"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Wheat } from "lucide-react";
import { useLanguage, dictionary } from "@/lib/i18n";
import FarmBackdrop from "./FarmBackdrop";

export default function Hero() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const popularTerms = dictionary[lang].popular_terms;

  function goToTerm(term: string) {
    router.push(`/kjop-og-selg?q=${encodeURIComponent(term)}`);
  }

  function handleSubmit() {
    router.push(`/kjop-og-selg?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="relative overflow-hidden furrow-bg">
      <FarmBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sage/70 border border-moss/20 rounded-full pl-2.5 pr-3.5 py-1.5">
            <span className="w-5 h-5 rounded-full bg-moss flex items-center justify-center shrink-0">
              <Wheat size={12} className="text-paper" />
            </span>
            <span className="font-tag text-xs font-medium text-moss-dark">
              {t("hero_eyebrow")}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink leading-[1.05]">
            {t("hero_title")}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-ink/75 max-w-xl">
            {t("hero_subtitle")}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-10 bg-cream-card rounded-xl shadow-lg shadow-ink/5 border border-steel-light p-3 sm:p-3 flex flex-col sm:flex-row gap-2 max-w-3xl"
        >
          <label className="flex-1 flex items-center gap-3 px-3 py-3 rounded-lg bg-paper">
            <Search size={20} className="text-steel shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder={t("search_placeholder")}
              className="w-full bg-transparent outline-none text-ink placeholder:text-steel text-[15px]"
            />
          </label>
          <label className="sm:w-56 flex items-center gap-3 px-3 py-3 rounded-lg bg-paper">
            <MapPin size={20} className="text-steel shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              type="text"
              placeholder={t("search_location")}
              className="w-full bg-transparent outline-none text-ink placeholder:text-steel text-[15px]"
            />
          </label>
          <button
            type="submit"
            className="bg-moss hover:bg-moss-dark transition-colors text-paper font-semibold px-8 py-3 rounded-lg text-[15px]"
          >
            {t("search_button")}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 max-w-2xl">
          <span className="text-sm text-ink/60 mr-1">{t("search_examples")}</span>
          {popularTerms.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => goToTerm(term)}
              className="text-sm font-medium bg-cream-card border border-steel-light rounded-full px-3.5 py-1.5 text-ink/75 hover:border-moss hover:text-moss-dark hover:bg-sage/40 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
