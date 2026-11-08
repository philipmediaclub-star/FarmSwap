import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashbord",
          "/meldinger",
          "/min-profil",
          "/ny-annonse",
          "/rediger/",
          "/logg-inn",
          "/opprett-konto",
          "/glemt-passord",
          "/nytt-passord",
          "/profil/",
          "/sok",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
