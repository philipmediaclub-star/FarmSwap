"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Row = { id: string; title: string; status: string };

export default function MyOtherAds({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const [services, setServices] = useState<Row[]>([]);
  const [jobs, setJobs] = useState<Row[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("services").select("id, title, status").eq("provider_id", userId).neq("status", "removed")
      .then(({ data }) => setServices(data ?? []));
    supabase.from("jobs").select("id, title, status").eq("poster_id", userId).neq("status", "removed")
      .then(({ data }) => setJobs(data ?? []));
  }, [userId]);

  async function remove(table: "services" | "jobs", id: string) {
    if (!window.confirm(t("edit_confirm_remove"))) return;
    const supabase = createClient();
    const { error } = await supabase.from(table).update({ status: "removed" }).eq("id", id);
    if (error) return alert(error.message);
    (table === "services" ? setServices : setJobs)((prev) => prev.filter((r) => r.id !== id));
  }

  const rows = [
    ...services.map((r) => ({ ...r, table: "services" as const, kind: "tjeneste" })),
    ...jobs.map((r) => ({ ...r, table: "jobs" as const, kind: "jobb" })),
  ];
  if (rows.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold text-ink mb-3">{t("dashboard_section_other")}</h2>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={`${r.table}-${r.id}`} className="bg-cream-card border border-steel-light rounded-lg px-4 py-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{r.title}</p>
              <p className="text-xs text-ink/55 mt-0.5">{r.table === "services" ? "Tjeneste" : "Jobb"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/rediger/${r.kind}/${r.id}`} className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors">
                {t("edit_button")}
              </Link>
              <button onClick={() => remove(r.table, r.id)} className="text-xs font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors">
                {t("dashboard_remove_listing")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
