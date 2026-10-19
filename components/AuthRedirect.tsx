"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// If a password-reset link lands on any page (e.g. the front page because the
// redirect URL was not allow-listed), send the user on to the new-password form.
export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/nytt-passord") {
        router.replace("/nytt-passord");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
