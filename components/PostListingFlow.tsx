"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tractor, Repeat, Wrench, Users, ArrowLeft, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import SellForm from "./forms/SellForm";
import RentForm from "./forms/RentForm";
import ServiceForm from "./forms/ServiceForm";
import JobForm from "./forms/JobForm";

type ListingType = "sell" | "rent" | "service" | "job";

export default function PostListingFlow() {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [type, setType] = useState<ListingType | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  if (userId === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-ink/50">…</div>;
  }

  if (userId === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center mx-auto">
          <Lock size={20} className="text-moss-dark" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          {t("post_login_required_title")}
        </h1>
        <p className="mt-2 text-ink/65">{t("post_login_required_body")}</p>
        <Link
          href="/logg-inn"
          className="mt-6 inline-block bg-moss hover:bg-moss-dark text-paper font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {t("auth_go_login")}
        </Link>
      </div>
    );
  }

  if (!type) {
    const options: {
      key: ListingType;
      icon: typeof Tractor;
      titleKey: "post_choose_sell" | "post_choose_rent" | "post_choose_service" | "post_choose_job";
      descKey:
        | "post_choose_sell_desc"
        | "post_choose_rent_desc"
        | "post_choose_service_desc"
        | "post_choose_job_desc";
    }[] = [
      { key: "sell", icon: Tractor, titleKey: "post_choose_sell", descKey: "post_choose_sell_desc" },
      { key: "rent", icon: Repeat, titleKey: "post_choose_rent", descKey: "post_choose_rent_desc" },
      { key: "service", icon: Wrench, titleKey: "post_choose_service", descKey: "post_choose_service_desc" },
      { key: "job", icon: Users, titleKey: "post_choose_job", descKey: "post_choose_job_desc" },
    ];

    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display text-3xl font-bold text-ink text-center">
          {t("post_choose_title")}
        </h1>
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {options.map(({ key, icon: Icon, titleKey, descKey }) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className="text-left bg-cream-card border border-steel-light rounded-xl p-5 hover:border-moss hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-sage flex items-center justify-center">
                <Icon size={20} className="text-moss-dark" />
              </div>
              <h3 className="mt-3 font-display font-semibold text-ink">{t(titleKey)}</h3>
              <p className="mt-1 text-sm text-ink/60">{t(descKey)}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
      <button
        onClick={() => setType(null)}
        className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-moss-dark mb-6"
      >
        <ArrowLeft size={16} />
        {t("post_back")}
      </button>

      {type === "sell" && <SellForm userId={userId} />}
      {type === "rent" && <RentForm userId={userId} />}
      {type === "service" && <ServiceForm userId={userId} />}
      {type === "job" && <JobForm userId={userId} />}
    </div>
  );
}
