import type { Metadata } from "next";
import { Ubuntu, Roboto, Nunito } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Jaslin Occius — Ingenieur Logiciel & Developpeur Fullstack",
  description:
    "Portfolio de Jaslin Occius : ingenieur logiciel, developpeur fullstack et enseignant universitaire a l'UJEPH, Pignon, Haiti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${ubuntu.variable} ${roboto.variable} ${nunito.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
