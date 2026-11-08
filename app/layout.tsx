import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-url";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import AuthRedirect from "@/components/AuthRedirect";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FarmSwap – Kjøp, selg og lei landbruksutstyr",
    template: "%s | FarmSwap",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "nb_NO",
    url: "/",
    title: "FarmSwap – Kjøp, selg og lei landbruksutstyr",
    description: SITE_DESCRIPTION,
    images: [{ url: "/logo.png", alt: "FarmSwap" }],
  },
  twitter: {
    card: "summary",
    title: "FarmSwap – Kjøp, selg og lei landbruksutstyr",
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="no" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthRedirect />
          <PageViewTracker />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
