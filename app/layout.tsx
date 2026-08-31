import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "FarmSwap — Finn. Lei. Selg. Del.",
  description:
    "Landbruksutstyr og tjenester – samlet på ett sted. Landbrukets Finn.no",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="no" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
