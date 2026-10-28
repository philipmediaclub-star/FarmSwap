"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit/i;

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("fs_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("fs_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function referrerHost(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname;
    return host === window.location.hostname ? null : host;
  } catch {
    return null;
  }
}

// Counts page views without cookies, IP addresses or any personal data.
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (navigator.webdriver || BOT.test(navigator.userAgent)) return;

    const w = window.innerWidth;
    const device = w < 640 ? "mobil" : w < 1024 ? "nettbrett" : "pc";
    createClient()
      .from("page_views")
      .insert({
        path: pathname.slice(0, 300),
        referrer: referrerHost(),
        session_id: sessionId(),
        device,
        lang: document.documentElement.lang || null,
      })
      .then(() => {});
  }, [pathname]);

  return null;
}
