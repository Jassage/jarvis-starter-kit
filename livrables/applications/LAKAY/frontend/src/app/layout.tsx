import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' });

export const metadata: Metadata = {
  title: {
    default: 'LAKAY — Immobilier en Haïti',
    template: '%s | LAKAY',
  },
  description: 'La plateforme immobilière de référence en Haïti. Trouvez votre maison, appartement, terrain ou local commercial à louer ou à vendre.',
  keywords: ['immobilier haiti', 'maison à louer haiti', 'appartement port-au-prince', 'terrain haiti', 'lakay'],
  openGraph: {
    title: 'LAKAY — Immobilier en Haïti',
    description: 'Trouvez votre bien immobilier idéal en Haïti',
    locale: 'fr_HT',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans bg-gray-50 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
