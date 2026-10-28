"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { todayISO } from "@/lib/promo";
import AdminCategories from "@/components/AdminCategories";
import AdminTraffic from "@/components/AdminTraffic";

type Tab = "stats" | "traffic" | "users" | "listings" | "reports" | "categories";

type ProfileRow = {
  id: string;
  full_name: string;
  farm_name: string | null;
  location: string | null;
  verified: boolean;
  is_admin: boolean;
  created_at: string;
  deleted_at: string | null;
};

type ItemRow = {
  id: string;
  title: string;
  status: string;
  owner_id: string | null;
  created_at: string | null;
  promoted_from: string | null;
  promoted_until: string | null;
  table: "listings" | "rentals" | "services" | "jobs";
};

const OWNER_COLUMN = {
  listings: "seller_id",
  rentals: "owner_id",
  services: "provider_id",
  jobs: "poster_id",
} as const;

const TABLE_LABEL = {
  listings: "Kjøp & Salg",
  rentals: "Lei",
  services: "Tjenester",
  jobs: "Jobb",
} as const;

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
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [items, setItems] = useState<ItemRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
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

      // Emails on the admin list (admin_emails table) get admin rights once their address is confirmed.
      await supabase.rpc("claim_admin");

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

      // Housekeeping: permanently delete users that were removed more than 6 months ago.
      await supabase.rpc("purge_expired_users");
      const { data: emailRows } = await supabase.rpc("admin_user_emails");
      setEmails(
        Object.fromEntries(((emailRows ?? []) as { id: string; email: string }[]).map((r) => [r.id, r.email]))
      );

      const [
        { data: userRows },
        { data: listingRows, error: listingErr },
        { data: rentalRows, error: rentalErr },
        { data: serviceRows, error: serviceErr },
        { data: jobRows, error: jobErr },
        { data: reportRows },
      ] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("listings").select("*").order("created_at", { ascending: false }),
          supabase.from("rentals").select("*").order("created_at", { ascending: false }),
          supabase.from("services").select("*").order("created_at", { ascending: false }),
          supabase.from("jobs").select("*").order("created_at", { ascending: false }),
          supabase
            .from("reports")
            .select("*, reporter:profiles!reports_reporter_id_fkey(full_name)")
            .order("created_at", { ascending: false }),
        ]);

      setLoadErrors(
        [
          ["listings", listingErr],
          ["rentals", rentalErr],
          ["services", serviceErr],
          ["jobs", jobErr],
        ]
          .filter(([, e]) => e)
          .map(([n, e]) => `${n}: ${(e as { message: string }).message}`)
      );
      setUsers(userRows ?? []);
      const toItem = (r: Record<string, any>, table: ItemRow["table"]): ItemRow => ({
        id: r.id,
        title: r.title,
        status: r.status,
        owner_id: r[OWNER_COLUMN[table]] ?? null,
        created_at: r.created_at ?? null,
        promoted_from: r.promoted_from ?? null,
        promoted_until: r.promoted_until ?? null,
        table,
      });
      setItems(
        [
          ...(listingRows ?? []).map((r) => toItem(r, "listings")),
          ...(rentalRows ?? []).map((r) => toItem(r, "rentals")),
          ...(serviceRows ?? []).map((r) => toItem(r, "services")),
          ...(jobRows ?? []).map((r) => toItem(r, "jobs")),
        ].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
      );
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
    const { data, error } = await supabase
      .from(table)
      .update({ status: "removed" })
      .eq("id", id)
      .select("id");
    if (error || !data || data.length === 0) {
      // Zero rows updated means Row Level Security blocked it (admin policy missing).
      alert(
        `Kunne ikke fjerne (${table}): ${error?.message ?? "ingen rader oppdatert – mangler admin-policy i Supabase (kjør supabase/migrations/005_admin_fix.sql)"}`
      );
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id && i.table === table ? { ...i, status: "removed" } : i)));
  }

  async function deleteItem(table: ItemRow["table"], id: string, title: string) {
    if (!window.confirm(`Slette "${title}" permanent? Dette kan ikke angres.`)) return;
    const supabase = createClient();
    const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
    if (error || !data || data.length === 0) {
      alert(
        `Kunne ikke slette (${table}): ${error?.message ?? "ingen rader slettet – kjør supabase/migrations/006_admin_delete.sql"}`
      );
      return;
    }
    setItems((prev) => prev.filter((i) => !(i.id === id && i.table === table)));
  }

  async function setPromotion(table: ItemRow["table"], id: string, from: string | null, until: string | null) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .update({ promoted_from: from, promoted_until: until })
      .eq("id", id)
      .select("id");
    if (error || !data || data.length === 0) {
      alert(error?.message ?? "Kunne ikke lagre (kjør supabase/migrations/009_jobs_promo_admins.sql).");
      return false;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.table === table ? { ...i, promoted_from: from, promoted_until: until } : i))
    );
    return true;
  }

  async function removeUser(u: ProfileRow) {
    if (!window.confirm(t("admin_user_remove_confirm" as never).replace("{name}", u.full_name))) return;
    const { error } = await createClient().rpc("admin_remove_user", { p_user: u.id });
    if (error) return alert(error.message);
    const now = new Date().toISOString();
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, deleted_at: now } : p)));
    setItems((prev) => prev.map((i) => (i.owner_id === u.id ? { ...i, status: "removed" } : i)));
  }

  async function restoreUser(u: ProfileRow) {
    const { error } = await createClient().rpc("admin_restore_user", { p_user: u.id });
    if (error) return alert(error.message);
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, deleted_at: null } : p)));
  }

  async function purgeUser(u: ProfileRow) {
    if (!window.confirm(t("admin_user_purge_confirm" as never).replace("{name}", u.full_name))) return;
    const { error } = await createClient().rpc("admin_purge_user", { p_user: u.id });
    if (error) return alert(error.message);
    setUsers((prev) => prev.filter((p) => p.id !== u.id));
    setItems((prev) => prev.filter((i) => i.owner_id !== u.id));
  }

  async function toggleVerified(u: ProfileRow) {
    const { data, error } = await createClient()
      .from("profiles")
      .update({ verified: !u.verified })
      .eq("id", u.id)
      .select("id");
    if (error || !data || data.length === 0) return alert(error?.message ?? t("auth_error_generic"));
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, verified: !u.verified } : p)));
  }

  async function toggleAdmin(u: ProfileRow) {
    if (!window.confirm(u.is_admin ? t("admin_confirm_remove_admin") : t("admin_confirm_make_admin"))) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_admin: !u.is_admin })
      .eq("id", u.id)
      .select("id");
    if (error || !data || data.length === 0) {
      alert(error?.message ?? "Kunne ikke endre (kjør supabase/migrations/009_jobs_promo_admins.sql).");
      return;
    }
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, is_admin: !u.is_admin } : p)));
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
        {(["stats", "traffic", "reports", "listings", "users", "categories"] as Tab[]).map((tKey) => (
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
            {loadErrors.length > 0 && (
              <div className="text-sm text-barn bg-barn/10 rounded-lg p-3">
                Kunne ikke hente alle annonser:
                <ul className="list-disc ml-5">
                  {loadErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-ink/50">
              {(Object.keys(TABLE_LABEL) as Array<keyof typeof TABLE_LABEL>)
                .map((k) => `${TABLE_LABEL[k]}: ${items.filter((i) => i.table === k).length}`)
                .join(" · ")}
              {" — "}viser kun annonser som ligger i databasen (ikke demo-annonser).
            </p>
            {items.length === 0 && <p className="text-sm text-ink/50">{t("admin_no_listings")}</p>}
            {items.map((i) => {
              const owner = users.find((u) => u.id === i.owner_id);
              return (
                <div
                  key={`${i.table}-${i.id}`}
                  className="bg-cream-card border border-steel-light rounded-lg px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{i.title}</p>
                    <p className="text-xs text-ink/50">
                      {TABLE_LABEL[i.table]} · {owner?.full_name ?? "Ukjent bruker"}
                      {i.status !== "active" ? ` · ${i.status}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {i.status === "active" && (
                      <PromoControl item={i} onSave={(from, until) => setPromotion(i.table, i.id, from, until)} t={t} />
                    )}
                    {i.status === "removed" ? (
                      <span className="text-xs font-semibold bg-barn/10 text-barn px-2.5 py-1 rounded-full">
                        {t("admin_removed_label")}
                      </span>
                    ) : (
                      <button
                        onClick={() => removeItem(i.table, i.id)}
                        className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors"
                      >
                        {t("admin_remove_button")}
                      </button>
                    )}
                    <button
                      onClick={() => deleteItem(i.table, i.id, i.title)}
                      className="text-xs font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors"
                    >
                      Slett
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "users" && (
          <div className="flex flex-col gap-2">
            {users.filter((u) => !u.deleted_at).length === 0 && (
              <p className="text-sm text-ink/50">{t("admin_no_users")}</p>
            )}
            {users
              .filter((u) => !u.deleted_at)
              .map((u) => (
                <div
                  key={u.id}
                  className="bg-cream-card border border-steel-light rounded-lg px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                      {u.full_name}
                      {u.verified && <ShieldCheck size={13} className="text-moss-dark" />}
                    </p>
                    <p className="text-xs text-ink/50">
                      {emails[u.id] ?? ""}
                      {u.farm_name ? ` · ${u.farm_name}` : ""}
                      {u.location ? ` · ${u.location}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {u.is_admin && (
                      <span className="text-xs font-semibold bg-sage text-moss-dark px-2.5 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                    <button
                      onClick={() => toggleVerified(u)}
                      className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors"
                    >
                      {u.verified ? t("admin_unverify" as never) : t("admin_verify" as never)}
                    </button>
                    {u.id !== userId && (
                      <>
                        <button
                          onClick={() => toggleAdmin(u)}
                          className="text-xs font-semibold border border-steel-light text-ink/70 px-3 py-1.5 rounded-md hover:bg-sage/30 transition-colors"
                        >
                          {u.is_admin ? t("admin_remove_admin") : t("admin_make_admin")}
                        </button>
                        {!u.is_admin && (
                          <button
                            onClick={() => removeUser(u)}
                            className="text-xs font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors"
                          >
                            {t("admin_user_remove" as never)}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

            {users.some((u) => u.deleted_at) && (
              <div className="mt-8">
                <h3 className="font-display font-semibold text-ink text-sm">{t("admin_removed_users_title" as never)}</h3>
                <p className="text-xs text-ink/50 mt-1 mb-3">{t("admin_removed_users_note" as never)}</p>
                <div className="flex flex-col gap-2">
                  {users
                    .filter((u) => u.deleted_at)
                    .sort((a, b) => (b.deleted_at ?? "").localeCompare(a.deleted_at ?? ""))
                    .map((u) => {
                      const purgeAt = new Date(u.deleted_at as string);
                      purgeAt.setMonth(purgeAt.getMonth() + 6);
                      const daysLeft = Math.max(0, Math.ceil((purgeAt.getTime() - Date.now()) / 86400000));
                      return (
                        <div
                          key={u.id}
                          className="bg-cream-card border border-barn/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink">{u.full_name}</p>
                            <p className="text-xs text-ink/50">
                              {emails[u.id] ?? ""} · {t("admin_removed_on" as never)}{" "}
                              {new Date(u.deleted_at as string).toLocaleDateString("nb-NO")} ·{" "}
                              {t("admin_deleted_in_days" as never).replace("{n}", String(daysLeft))}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => restoreUser(u)}
                              className="text-xs font-semibold bg-moss text-paper px-3 py-1.5 rounded-md hover:bg-moss-dark transition-colors"
                            >
                              {t("admin_user_restore" as never)}
                            </button>
                            <button
                              onClick={() => purgeUser(u)}
                              className="text-xs font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors"
                            >
                              {t("admin_user_purge" as never)}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "categories" && <AdminCategories />}
        {tab === "traffic" && <AdminTraffic />}
      </div>
    </div>
  );
}

function PromoControl({
  item,
  onSave,
  t,
}: {
  item: ItemRow;
  onSave: (from: string | null, until: string | null) => Promise<boolean>;
  t: (k: never) => string;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(item.promoted_from ?? todayISO());
  const [until, setUntil] = useState(item.promoted_until ?? "");
  const today = todayISO();
  const has = !!item.promoted_from && !!item.promoted_until;
  const state = !has
    ? null
    : item.promoted_until! < today
      ? "expired"
      : item.promoted_from! > today
        ? "planned"
        : "active";

  async function save() {
    if (!from || !until || until < from) {
      alert(t("admin_promo_dates_error" as never));
      return;
    }
    if (await onSave(from, until)) setOpen(false);
  }

  if (open) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <label className="flex items-center gap-1">
          {t("admin_promo_from" as never)}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-steel-light rounded px-1.5 py-1 bg-paper" />
        </label>
        <label className="flex items-center gap-1">
          {t("admin_promo_until" as never)}
          <input type="date" value={until} min={from} onChange={(e) => setUntil(e.target.value)} className="border border-steel-light rounded px-1.5 py-1 bg-paper" />
        </label>
        <button onClick={save} className="font-semibold bg-moss text-paper px-3 py-1.5 rounded-md hover:bg-moss-dark">
          {t("admin_promo_save" as never)}
        </button>
        <button onClick={() => setOpen(false)} className="text-ink/55 hover:underline">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {state && (
        <span
          className={`font-semibold px-2 py-1 rounded-full ${
            state === "active" ? "bg-barn text-white" : "bg-steel-light/60 text-ink/60"
          }`}
          title={`${item.promoted_from} – ${item.promoted_until}`}
        >
          {t((state === "active" ? "admin_promo_active" : state === "planned" ? "admin_promo_planned" : "admin_promo_expired") as never)}{" "}
          {item.promoted_from} – {item.promoted_until}
        </span>
      )}
      <button
        onClick={() => setOpen(true)}
        className="font-semibold border border-barn/40 text-barn px-3 py-1.5 rounded-md hover:bg-barn/10 transition-colors"
      >
        {t("admin_promo_button" as never)}
      </button>
      {has && (
        <button onClick={() => onSave(null, null)} className="text-ink/55 hover:underline">
          {t("admin_promo_remove" as never)}
        </button>
      )}
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
