import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'REYINYON — Visioconférence résiliente',
  description: 'Visioconférence WebRTC pensée pour les connexions instables (Haïti/Caraïbes)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.variable}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
