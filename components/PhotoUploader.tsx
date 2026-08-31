"use client";

import { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PhotoUploader({
  userId,
  pathPrefix,
  urls,
  onChange,
}: {
  userId: string;
  /** e.g. "listings" or "rentals" — keeps upload paths tidy per listing type */
  pathPrefix: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of Array.from(files).slice(0, 10 - urls.length)) {
      const path = `${userId}/${pathPrefix}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    onChange([...urls, ...newUrls]);
    setUploading(false);
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {urls.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-steel-light">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Fjern bilde"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/70 text-paper flex items-center justify-center"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {urls.length < 10 && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-steel-light flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-moss transition-colors">
            {uploading ? (
              <Loader2 size={20} className="text-steel animate-spin" />
            ) : (
              <>
                <ImagePlus size={20} className="text-steel" />
                <span className="text-[11px] text-steel">Legg til bilde</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-barn">{error}</p>}
      <p className="mt-2 text-xs text-ink/45">Maks 10 bilder.</p>
    </div>
  );
}
