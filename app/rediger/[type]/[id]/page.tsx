"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellForm from "@/components/forms/SellForm";
import RentForm from "@/components/forms/RentForm";
import ServiceForm from "@/components/forms/ServiceForm";
import JobForm from "@/components/forms/JobForm";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

const TABLES = { selg: "listings", lei: "rentals", tjeneste: "services", jobb: "jobs" } as const;
const OWNER = { listings: "seller_id", rentals: "owner_id", services: "provider_id", jobs: "poster_id" } as const;

export default function EditPage() {
  const { t } = useLanguage();
  const params = useParams<{ type: string; id: string }>();
  const [state, setState] = useState<"loading" | "notfound" | "ready">("loading");
  const [userId, setUserId] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row, setRow] = useState<Record<string, any> | null>(null);

  const kind = params.type as keyof typeof TABLES;
  const table = TABLES[kind];

  useEffect(() => {
    if (!table) {
      setState("notfound");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) return setState("notfound");
      const { data: found } = await supabase.from(table).select("*").eq("id", params.id).single();
      // Only the owner may edit (the database enforces this too).
      if (!found || found[OWNER[table]] !== uid) return setState("notfound");
      setUserId(uid);
      setRow(found);
      setState("ready");
    });
  }, [table, params.id]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
          {state === "loading" && <p className="text-ink/50">…</p>}
          {state === "notfound" && (
            <div>
              <p className="text-ink/70">{t("edit_not_found")}</p>
              <Link href="/dashbord" className="text-moss-dark font-semibold hover:underline">
                {t("edit_back")}
              </Link>
            </div>
          )}
          {state === "ready" && row && (
            <>
              {kind === "selg" && <SellForm userId={userId} editId={params.id} initial={row} />}
              {kind === "lei" && <RentForm userId={userId} editId={params.id} initial={row} />}
              {kind === "tjeneste" && <ServiceForm userId={userId} editId={params.id} initial={row} />}
              {kind === "jobb" && <JobForm userId={userId} editId={params.id} initial={row} />}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
