import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITRE_SITE = "Gros-Morne — Vil Mwen | Histoire, Tourisme & Communauté";
// Corrigé (2026-08-06) : Gros-Morne est dans le département de l'Artibonite, pas le
// Nord-Ouest — même erreur déjà rectifiée sur les pages qui définissaient leur propre
// metadata (ex. app/page.tsx), seul ce repli racine ne l'avait jamais été.
const DESCRIPTION_SITE =
  "Découvrez Gros-Morne, commune du département de l'Artibonite en Haïti. Histoire, géographie, lieux touristiques, culture et communauté en ligne.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITRE_SITE, template: "%s" },
  description: DESCRIPTION_SITE,
  openGraph: {
    title: TITRE_SITE,
    description: DESCRIPTION_SITE,
    siteName: "Smart Gros-Morne",
    locale: "fr_HT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITRE_SITE,
    description: DESCRIPTION_SITE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
