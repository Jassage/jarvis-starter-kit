import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import '../styles/tokens.css';
import '../styles/app.css';
import '../styles/landing.css';
import '../styles/screens.css';
import Providers from '@/components/Providers';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const geistMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata = {
  title: 'EduSpher — Apprends, progresse, certifie-toi',
  description: 'La plateforme e-learning qui combine cours experts, suivi de progression et certificats reconnus.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${geistMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
