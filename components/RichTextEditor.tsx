"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter,
  AlignRight, Link2, ImagePlus, Undo2, Redo2, Loader2, Eraser,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

function Btn({
  label, onClick, children,
}: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // keep the text selection in the editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-8 h-8 rounded-md flex items-center justify-center text-ink/70 hover:bg-steel-light/60"
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  initialHtml,
  userId,
  onChange,
}: {
  initialHtml: string;
  userId: string;
  onChange: (html: string) => void;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    onChange(ref.current?.innerHTML ?? "");
  }

  function cmd(command: string, value?: string) {
    ref.current?.focus();
    document.execCommand(command, false, value);
    emit();
  }

  function addLink() {
    const url = window.prompt(t("editor_link_prompt"), "https://");
    if (url && /^(https?:|mailto:)/i.test(url)) cmd("createLink", url);
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const path = `${userId}/pages/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    cmd("insertImage", data.publicUrl);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="border border-steel-light rounded-lg bg-paper">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-steel-light bg-cream-card rounded-t-lg">
        <Btn label={t("editor_undo")} onClick={() => cmd("undo")}><Undo2 size={16} /></Btn>
        <Btn label={t("editor_redo")} onClick={() => cmd("redo")}><Redo2 size={16} /></Btn>
        <span className="w-px h-5 bg-steel-light mx-1" />

        <select
          aria-label={t("editor_style")}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) cmd("formatBlock", e.target.value);
            e.target.value = "";
          }}
          className="h-8 text-sm rounded-md border border-steel-light bg-paper px-1"
        >
          <option value="">{t("editor_style")}</option>
          <option value="p">{t("editor_paragraph")}</option>
          <option value="h2">{t("editor_heading")}</option>
          <option value="h3">{t("editor_subheading")}</option>
        </select>

        <select
          aria-label={t("editor_size")}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) cmd("fontSize", e.target.value);
            e.target.value = "";
          }}
          className="h-8 text-sm rounded-md border border-steel-light bg-paper px-1 ml-1"
        >
          <option value="">{t("editor_size")}</option>
          <option value="2">{t("editor_size_small")}</option>
          <option value="3">{t("editor_size_normal")}</option>
          <option value="5">{t("editor_size_large")}</option>
          <option value="6">{t("editor_size_xlarge")}</option>
        </select>
        <span className="w-px h-5 bg-steel-light mx-1" />

        <Btn label={t("editor_bold")} onClick={() => cmd("bold")}><Bold size={16} /></Btn>
        <Btn label={t("editor_italic")} onClick={() => cmd("italic")}><Italic size={16} /></Btn>
        <Btn label={t("editor_underline")} onClick={() => cmd("underline")}><Underline size={16} /></Btn>
        <Btn label={t("editor_strike")} onClick={() => cmd("strikeThrough")}><Strikethrough size={16} /></Btn>
        <span className="w-px h-5 bg-steel-light mx-1" />

        <Btn label={t("editor_bullets")} onClick={() => cmd("insertUnorderedList")}><List size={16} /></Btn>
        <Btn label={t("editor_numbers")} onClick={() => cmd("insertOrderedList")}><ListOrdered size={16} /></Btn>
        <span className="w-px h-5 bg-steel-light mx-1" />

        <Btn label={t("editor_left")} onClick={() => cmd("justifyLeft")}><AlignLeft size={16} /></Btn>
        <Btn label={t("editor_center")} onClick={() => cmd("justifyCenter")}><AlignCenter size={16} /></Btn>
        <Btn label={t("editor_right")} onClick={() => cmd("justifyRight")}><AlignRight size={16} /></Btn>
        <span className="w-px h-5 bg-steel-light mx-1" />

        <Btn label={t("editor_link")} onClick={addLink}><Link2 size={16} /></Btn>
        <Btn label={t("editor_image")} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </Btn>
        <Btn label={t("editor_clear")} onClick={() => cmd("removeFormat")}><Eraser size={16} /></Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadImage(e.target.files?.[0])}
        />
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        className="rich min-h-[300px] p-4 outline-none"
      />
      {error && <p className="px-4 pb-3 text-xs text-barn">{error}</p>}
    </div>
  );
}
