"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CategorySection = "sell" | "rent" | "service";

/** Used until the list has loaded, and if the categories table is empty or missing. */
export const DEFAULT_CATEGORIES: Record<CategorySection, string[]> = {
  sell: ["Traktor", "Jordbruksutstyr", "Tilhenger", "Skurtresker", "Redskap", "Annet"],
  rent: ["Redskap", "Såmaskin", "Tilhenger", "Vintervedlikehold", "Annet"],
  service: ["Leiekjøring", "Høsting", "Transport", "Snømåking", "Skogsarbeid", "Reparasjon", "Annet"],
};

/** The category list for a posting form, as managed by admins. */
export function useCategories(section: CategorySection): string[] {
  const [list, setList] = useState<string[]>(DEFAULT_CATEGORIES[section]);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("name")
      .eq("section", section)
      .order("sort_order")
      .order("name")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setList(data.map((r) => r.name as string));
      });
  }, [section]);

  return list;
}
