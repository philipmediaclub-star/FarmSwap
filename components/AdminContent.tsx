"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Tab = "stats" | "users" | "listings" | "reports" | "categories";

type ProfileRow = {
  id: string;
  full_name: string;
  farm_name: string | null;
  location: string | null;
  verified: boolean;
  is_admin: boolean;
  created_at: string;
};

type ItemRow = {
  id: string;
  title: string;
  status: string;
  table: "listings" | "rentals" | "services" | "jobs";
};

type ReportRow = {
  id: string;
  listing_type: string;
  listing_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: { full_name: string } | null;
};

type SiteStats = {
  totalUsers: number;
  activeListings: number;
  activeRentals: number;
  activeServices: number;
  activeJobs: number;
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
  reservationsByStatus: Record<string, number>;
};

export default function AdminContent() {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("stats");

  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", uid)
        .single();

      if (!profile?.is_admin) {
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      const [{ data: userRows }, { data: listingRows }, { data: rentalRows }, { data: serviceRows }, { data: jobRows }, { data: reportRows }] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("listings").select("id, title, status, view_count").order("created_at", { ascending: false }),
          supabase.from("rentals").select("id, title, status, view_count").order("created_at", { ascending: false }),
          supabase.from("services").select("id, title, status, view_count").order("created_at", { ascending: false }),
          supabase.from("jobs").select("id, title, status, view_count").order("created_at", { ascending: false }),
          supabase
            .from("reports")
            .select("*, reporter:profiles!reports_reporter_id_fkey(full_name)")
            .order("created_at", { ascending: false }),
        ]);

      setUsers(userRows ?? []);
      setItems([
        ...(listingRows ?? []).map((r) => ({ ...r, table: "listings" as const })),
        ...(rentalRows ?? []).map((r) => ({ ...r, table: "rentals" as const })),
        ...(serviceRows ?? []).map((r) => ({ ...r, table: "services" as const })),
        ...(jobRows ?? []).map((r) => ({ ...r, table: "jobs" as const })),
      ]);
      setReports((reportRows as unknown as ReportRow[]) ?? []);

      const [{ count: favCount }, { count: msgCount }, { data: reservationRows }] = await Promise.all([
        supabase.from("favorites").select("user_id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("reservations").select("status"),
      ]);

      const totalViews = [
        ...(listingRows ?? []),
        ...(rentalRows ?? []),
        ...(serviceRows ?? []),
        ...(jobRows ?? []),
      ].reduce((sum, row) => sum + (row.view_count ?? 0), 0);

      const reservationsByStatus = (reservationRows ?? []).reduce(
        (acc: Record<string, number>, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1;
          return acc;
        },
        {}
      );

      setSiteStats({
        totalUsers: (userRows ?? []).length,
        activeListings: (listingRows ?? []).filter((r) => r.status === "active").length,
        activeRentals: (rentalRows ?? []).filter((r) => r.status === "active").length,
        activeServices: (serviceRows ?? []).filter((r) => r.status === "active").length,
        activeJobs: (jobRows ?? []).filter((r) => r.status === "active").length,
        totalViews,
        totalFavorites: favCount ?? 0,
        totalMessages: msgCount ?? 0,
        reservationsByStatus,
      });

      setLoading(false);
    });
  }, []);

  async function removeItem(table: ItemRow["table"], id: string) {
    const supabase = createClient();
    await supabase.from(table).update({ status: "removed" }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id && i.table === table ? { ...i, status: "removed" } : i)));
  }

  async function updateReport(id: string, status: "reviewed" | "dismissed") {
    const supabase = createClient();
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  if (loading || userId === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-ink/50">…</div>;
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center mx-auto">
          <Lock size={20} className="text-moss-dark" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          {t("post_login_required_title")}
        </h1>
        <Link
          href="/logg-inn"
          className="mt-6 inline-block bg-moss hover:bg-moss-dark text-paper font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {t("auth_go_login")}
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24 text-center">
        <ShieldAlert size={32} className="text-barn mx-auto" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          {t("admin_access_denied_title")}
        </h1>
        <p className="mt-2 text-ink/65">{t("admin_access_denied_body")}</p>
      </div>
    );
  }

  const openReports = reports.filter((r) => r.status === "open");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold text-ink">{t("admin_title")}</h1>

      <div className="mt-6 flex gap-2 border-b border-steel-light overflow-x-auto">
        {(["stats", "reports", "listings", "users", "categories"] as Tab[]).map((tKey) => (
          <button
            key={tKey}
            onClick={() => setTab(tKey)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === tKey ? "border-moss text-moss-dark" : "border-transparent text-ink/55 hover:text-ink"
            }`}
          >
            {t(`admin_tab_${tKey}` as never)}
            {tKey === "reports" && openReports.length > 0 && (
              <span className="ml-1.5 text-xs bg-barn text-white rounded-full px-1.5 py-0.5">
                {openReports.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "stats" && siteStats && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <AdminStatCard value={siteStats.totalUsers} label={t("admin_stat_total_users")} />
              <AdminStatCard value={siteStats.activeListings} label={t("admin_stat_active_listings")} />
              <AdminStatCard value={siteStats.activeRentals} label={t("admin_stat_active_rentals")} />
              <AdminStatCard value={siteStats.activeServices} label={t("admin_stat_active_services")} />
              <AdminStatCard value={siteStats.activeJobs} label={t("admin_stat_active_jobs")} />
              <AdminStatCard value={siteStats.totalViews} label={t("admin_stat_total_views")} />
              <AdminStatCard value={siteStats.totalFavorites} label={t("admin_stat_total_favorites")} />
              <AdminStatCard value={siteStats.totalMessages} label={t("admin_stat_total_messages")} />
            </div>

            <div className="mt-8">
              <h3 className="font-display font-semibold text-ink text-sm mb-2">
                {t("admin_stat_reservations_by_status")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(siteStats.reservationsByStatus).map(([status, count]) => (
                  <span
                    key={status}
                    className="text-xs bg-cream-card border border-steel-light rounded-full px-3 py-1.5"
                  >
                    {status}: <strong>{count}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-display font-semibold text-ink text-sm mb-2">
                {t("admin_stat_reports_by_status")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {["open", "reviewed", "dismissed"].map((status) => (
                  <span
                    key={status}
                    className="text-xs bg-cream-card border border-steel-light rounded-full px-3 py-1.5"
                  >
                    {status}: <strong>{reports.filter((r) => r.status === status).length}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="flex flex-col gap-2">
            {reports.length === 0 && <p className="text-sm text-ink/50">{t("admin_no_reports")}</p>}
            {reports.map((r) => (
              <div key={r.id} className="bg-cream-card border border-steel-light rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {r.listing_type} · {r.reporter?.full_name}
                    </p>
                    <p className="text-sm text-ink/65 mt-1">{r.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={r.status} t={t} />
                    {r.status === "open" && (
                      <>
                        <button
                          onClick={() => updateReport(r.id, "reviewed")}
                          className="text-xs font-semibold bg-moss text-paper px-3 py-1.5 rounded-md hover:bg-moss-dark transition-colors"
                        >
                          {t("admin_mark_reviewed")}
                        </button>
                        <button
                          onClick={() => updateReport(r.id, "dismissed")}
                          className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors"
                        >
                          {t("admin_dismiss")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "listings" && (
          <div className="flex flex-col gap-2">
            {items.length === 0 && <p className="text-sm text-ink/50">{t("admin_no_listings")}</p>}
            {items.map((i) => (
              <div
                key={`${i.table}-${i.id}`}
                className="bg-cream-card border border-steel-light rounded-lg px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{i.title}</p>
                  <p className="text-xs text-ink/50">{i.table}</p>
                </div>
                {i.status === "removed" ? (
                  <span className="text-xs font-semibold bg-barn/10 text-barn px-2.5 py-1 rounded-full">
                    {t("admin_removed_label")}
                  </span>
                ) : (
                  <button
                    onClick={() => removeItem(i.table, i.id)}
                    className="text-xs font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors"
                  >
                    {t("admin_remove_button")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="flex flex-col gap-2">
            {users.length === 0 && <p className="text-sm text-ink/50">{t("admin_no_users")}</p>}
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-cream-card border border-steel-light rounded-lg px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                    {u.full_name}
                    {u.verified && <ShieldCheck size={13} className="text-moss-dark" />}
                  </p>
                  <p className="text-xs text-ink/50">
                    {u.farm_name} {u.location ? `· ${u.location}` : ""}
                  </p>
                </div>
                {u.is_admin && (
                  <span className="text-xs font-semibold bg-sage text-moss-dark px-2.5 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "categories" && (
          <p className="text-sm text-ink/60 max-w-lg">{t("admin_categories_note")}</p>
        )}
      </div>
    </div>
  );
}

function AdminStatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-cream-card border border-steel-light rounded-xl p-4">
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink/55 mt-0.5">{label}</p>
    </div>
  );
}

function StatusPill({ status, t }: { status: string; t: (k: never) => string }) {
  const key =
    status === "reviewed"
      ? "admin_report_status_reviewed"
      : status === "dismissed"
        ? "admin_report_status_dismissed"
        : "admin_report_status_open";
  const colors =
    status === "reviewed"
      ? "bg-sage/60 text-moss-dark"
      : status === "dismissed"
        ? "bg-steel-light/60 text-ink/60"
        : "bg-barn/10 text-barn";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors}`}>
      {t(key as never)}
    </span>
  );
}
