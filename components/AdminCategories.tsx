"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { CategorySection } from "@/lib/categories";

type Cat = { id: string; section: CategorySection; name: string; sort_order: number };

const SECTIONS: { key: CategorySection; labelKey: string; table: "listings" | "rentals" | "services" }[] = [
  { key: "sell", labelKey: "admin_cat_section_sell", table: "listings" },
  { key: "rent", labelKey: "admin_cat_section_rent", table: "rentals" },
  { key: "service", labelKey: "admin_cat_section_service", table: "services" },
];

export default function AdminCategories() {
  const { t } = useLanguage();
  const [cats, setCats] = useState<Cat[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [missing, setMissing] = useState(false);
  const [newName, setNewName] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
    if (error) {
      setMissing(true);
      return;
    }
    setCats((data ?? []) as Cat[]);

    // How many ads use each category (so admins see the effect of renaming/removing).
    const c: Record<string, number> = {};
    await Promise.all(
      SECTIONS.map(async (s) => {
        const { data: rows } = await supabase.from(s.table).select("category");
        for (const r of rows ?? []) {
          const k = `${s.key}:${(r as { category: string }).category}`;
          c[k] = (c[k] ?? 0) + 1;
        }
      })
    );
    setCounts(c);
  }

  useEffect(() => {
    load();
  }, []);

  const inSection = (s: CategorySection) =>
    cats.filter((c) => c.section === s).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  async function add(section: CategorySection) {
    const name = (newName[section] ?? "").trim();
    if (!name) return;
    const list = inSection(section);
    if (list.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert(t("admin_cat_exists" as never));
      return;
    }
    const next = (list[list.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await createClient().from("categories").insert({ section, name, sort_order: next });
    if (error) return alert(error.message);
    setNewName((p) => ({ ...p, [section]: "" }));
    load();
  }

  async function rename(cat: Cat) {
    const name = editName.trim();
    setEditing(null);
    if (!name || name === cat.name) return;
    if (inSection(cat.section).some((c) => c.id !== cat.id && c.name.toLowerCase() === name.toLowerCase())) {
      alert(t("admin_cat_exists" as never));
      return;
    }
    const used = counts[`${cat.section}:${cat.name}`] ?? 0;
    if (used > 0 && !window.confirm(t("admin_cat_rename_confirm" as never).replace("{n}", String(used)))) return;

    const supabase = createClient();
    const { error } = await supabase.from("categories").update({ name }).eq("id", cat.id);
    if (error) return alert(error.message);

    // Keep existing ads in sync with the new name.
    const table = SECTIONS.find((s) => s.key === cat.section)!.table;
    await supabase.from(table).update({ category: name }).eq("category", cat.name);
    load();
  }

  async function remove(cat: Cat) {
    const used = counts[`${cat.section}:${cat.name}`] ?? 0;
    const msg =
      used > 0
        ? t("admin_cat_delete_confirm_used" as never).replace("{n}", String(used))
        : t("admin_cat_delete_confirm" as never);
    if (!window.confirm(msg)) return;
    const { error } = await createClient().from("categories").delete().eq("id", cat.id);
    if (error) return alert(error.message);
    load();
  }

  async function move(cat: Cat, dir: -1 | 1) {
    const list = inSection(cat.section);
    const i = list.findIndex((c) => c.id === cat.id);
    const other = list[i + dir];
    if (!other) return;
    const supabase = createClient();
    // Renumber the whole section so the order is always unambiguous.
    const reordered = [...list];
    reordered[i] = other;
    reordered[i + dir] = cat;
    await Promise.all(
      reordered.map((c, idx) => supabase.from("categories").update({ sort_order: idx + 1 }).eq("id", c.id))
    );
    load();
  }

  if (missing) {
    return <p className="text-sm text-barn max-w-lg">{t("admin_cat_missing" as never)}</p>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <p className="lg:col-span-3 text-sm text-ink/60 max-w-2xl">{t("admin_cat_intro" as never)}</p>
      {SECTIONS.map((s) => (
        <div key={s.key} className="bg-cream-card border border-steel-light rounded-xl p-4">
          <h3 className="font-display font-semibold text-ink">{t(s.labelKey as never)}</h3>

          <ul className="mt-3 flex flex-col gap-1.5">
            {inSection(s.key).map((c, idx, arr) => (
              <li key={c.id} className="flex items-center gap-1.5 bg-paper border border-steel-light rounded-lg px-2.5 py-1.5">
                {editing === c.id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") rename(c);
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className="flex-1 min-w-0 text-sm bg-transparent outline-none border-b border-moss"
                    />
                    <button onClick={() => rename(c)} aria-label="OK" className="text-moss-dark"><Check size={15} /></button>
                    <button onClick={() => setEditing(null)} aria-label="Avbryt" className="text-ink/50"><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 min-w-0 truncate text-sm text-ink">
                      {c.name}
                      <span className="ml-1.5 text-xs text-ink/40">({counts[`${s.key}:${c.name}`] ?? 0})</span>
                    </span>
                    <button disabled={idx === 0} onClick={() => move(c, -1)} aria-label="Opp" className="text-ink/50 hover:text-ink disabled:opacity-25"><ArrowUp size={14} /></button>
                    <button disabled={idx === arr.length - 1} onClick={() => move(c, 1)} aria-label="Ned" className="text-ink/50 hover:text-ink disabled:opacity-25"><ArrowDown size={14} /></button>
                    <button onClick={() => { setEditing(c.id); setEditName(c.name); }} aria-label={t("admin_cat_rename" as never)} className="text-ink/50 hover:text-moss-dark"><Pencil size={14} /></button>
                    <button onClick={() => remove(c)} aria-label={t("admin_cat_delete" as never)} className="text-ink/50 hover:text-barn"><Trash2 size={14} /></button>
                  </>
                )}
              </li>
            ))}
            {inSection(s.key).length === 0 && <li className="text-xs text-ink/45">{t("admin_cat_empty" as never)}</li>}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              add(s.key);
            }}
            className="mt-3 flex gap-1.5"
          >
            <input
              value={newName[s.key] ?? ""}
              onChange={(e) => setNewName((p) => ({ ...p, [s.key]: e.target.value }))}
              placeholder={t("admin_cat_new_placeholder" as never)}
              className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-paper border border-steel-light outline-none focus:border-moss"
            />
            <button type="submit" aria-label={t("admin_cat_add" as never)} className="bg-moss hover:bg-moss-dark text-paper px-3 rounded-lg">
              <Plus size={16} />
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
