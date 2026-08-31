"use client";

import { useState } from "react";
import { User, Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AvatarUploader({
  userId,
  url,
  onChange,
}: {
  userId: string;
  url: string | null;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const path = `${userId}/avatar/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="relative w-20 h-20 rounded-full bg-sage flex items-center justify-center cursor-pointer overflow-hidden group">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={28} className="text-moss-dark" />
        )}

        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 size={18} className="text-paper animate-spin" />
          ) : (
            <Camera size={18} className="text-paper" />
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {error && <p className="mt-1.5 text-xs text-barn">{error}</p>}
    </div>
  );
}
