"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Traffic = {
  views: number;
  visitors: number;
  today_views: number;
  today_visitors: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { referrer: string; views: number }[];
  devices: { device: string; visitors: number }[];
};

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-cream-card border border-steel-light rounded-xl p-4">
      <p className="text-xs text-ink/55">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value.toLocaleString("nb-NO")}</p>
    </div>
  );
}

export default function AdminTraffic() {
  const { t } = useLanguage();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Traffic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    createClient()
      .rpc("admin_traffic", { p_days: days })
      .then(({ data: d, error: e }) => {
        if (e) setError(e.message);
        else {
          setError(null);
          setData(d as Traffic);
        }
      });
  }, [days]);

  if (error) {
    return (
      <p className="text-sm text-barn bg-cream-card border border-steel-light rounded-lg p-4">
        {t("admin_traffic_error")} ({error})
      </p>
    );
  }
  if (!data) return <p className="text-sm text-ink/50">…</p>;

  const max = Math.max(1, ...data.daily.map((d) => d.views));
  const totalDev = data.devices.reduce((a, b) => a + b.visitors, 0) || 1;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              days === d ? "bg-moss text-paper border-moss" : "border-steel-light text-ink/70"
            }`}
          >
            {d} {t("admin_traffic_days")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label={t("admin_traffic_today_visitors")} value={data.today_visitors} />
        <Tile label={t("admin_traffic_today_views")} value={data.today_views} />
        <Tile label={`${t("admin_traffic_visitors")} (${days} ${t("admin_traffic_days")})`} value={data.visitors} />
        <Tile label={`${t("admin_traffic_views")} (${days} ${t("admin_traffic_days")})`} value={data.views} />
      </div>

      <section>
        <h3 className="font-display font-semibold text-ink mb-3">{t("admin_traffic_per_day")}</h3>
        <div className="flex items-end gap-[2px] h-40 border-b border-steel-light">
          {data.daily.map((d) => (
            <div
              key={d.day}
              className="flex-1 min-w-[3px] bg-moss/80 hover:bg-moss rounded-t"
              style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views ? 2 : 0 }}
              title={`${d.day}: ${d.views} ${t("admin_traffic_views").toLowerCase()}, ${d.visitors} ${t("admin_traffic_visitors").toLowerCase()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-ink/45 mt-1">
          <span>{data.daily[0]?.day}</span>
          <span>{data.daily[data.daily.length - 1]?.day}</span>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h3 className="font-display font-semibold text-ink mb-3">{t("admin_traffic_pages")}</h3>
          <table className="w-full text-sm">
            <tbody>
              {data.pages.map((p) => (
                <tr key={p.path} className="border-b border-steel-light/60">
                  <td className="py-1.5 pr-2 truncate max-w-[16rem]">{p.path}</td>
                  <td className="py-1.5 text-right text-ink/60">{p.views}</td>
                  <td className="py-1.5 pl-3 text-right text-ink/40 w-16">{p.visitors} 👤</td>
                </tr>
              ))}
              {data.pages.length === 0 && (
                <tr><td className="py-2 text-ink/50">{t("admin_traffic_none")}</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="flex flex-col gap-8">
          <section>
            <h3 className="font-display font-semibold text-ink mb-3">{t("admin_traffic_referrers")}</h3>
            <table className="w-full text-sm">
              <tbody>
                {data.referrers.map((r) => (
                  <tr key={r.referrer} className="border-b border-steel-light/60">
                    <td className="py-1.5 pr-2">{r.referrer}</td>
                    <td className="py-1.5 text-right text-ink/60">{r.views}</td>
                  </tr>
                ))}
                {data.referrers.length === 0 && (
                  <tr><td className="py-2 text-ink/50">{t("admin_traffic_none")}</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="font-display font-semibold text-ink mb-3">{t("admin_traffic_devices")}</h3>
            <div className="flex flex-col gap-2">
              {data.devices.map((d) => (
                <div key={d.device} className="text-sm">
                  <div className="flex justify-between">
                    <span className="capitalize">{d.device}</span>
                    <span className="text-ink/60">{Math.round((d.visitors / totalDev) * 100)} %</span>
                  </div>
                  <div className="h-2 bg-steel-light/50 rounded-full mt-1">
                    <div className="h-2 bg-moss rounded-full" style={{ width: `${(d.visitors / totalDev) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <p className="text-xs text-ink/45">{t("admin_traffic_note")}</p>
    </div>
  );
}
