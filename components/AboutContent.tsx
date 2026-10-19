"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { sanitizeHtml } from "@/lib/sanitize";
import RichTextEditor from "@/components/RichTextEditor";

export default function AboutContent() {
  const { t } = useLanguage();
  const [html, setHtml] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_pages")
      .select("content")
      .eq("slug", "about")
      .maybeSingle()
      .then(({ data }) => setHtml(data?.content ?? ""));

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();
      setIsAdmin(!!profile?.is_admin);
    });
  }, []);

  const shown = html === null ? "" : html.trim() ? html : `<p>${t("about_default")}</p>`;

  function startEdit() {
    setDraft(sanitizeHtml(shown));
    setError(null);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const clean = sanitizeHtml(draft);
    const supabase = createClient();
    const { error: saveError } = await supabase.from("site_pages").upsert({
      slug: "about",
      content: clean,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setHtml(clean);
    setEditing(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">{t("about_title")}</h1>
        {isAdmin && !editing && (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 text-sm font-medium border border-steel-light rounded-lg px-3 py-1.5 hover:border-moss hover:text-moss"
          >
            <Pencil size={14} /> {t("about_edit")}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <RichTextEditor initialHtml={draft} userId={userId} onChange={setDraft} />
          {error && <p className="mt-3 text-sm text-barn">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="bg-moss hover:bg-moss-dark disabled:opacity-60 text-paper font-semibold px-5 py-2.5 rounded-lg"
            >
              {saving ? t("post_submitting") : t("about_save")}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="border border-steel-light px-5 py-2.5 rounded-lg text-ink/70"
            >
              {t("about_cancel")}
            </button>
          </div>
        </>
      ) : (
        <div className="rich" dangerouslySetInnerHTML={{ __html: sanitizeHtml(shown) }} />
      )}
    </div>
  );
}
