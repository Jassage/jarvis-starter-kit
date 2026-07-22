import Link from 'next/link';
import { Hotel } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <header className="border-b" style={{ borderColor: 'var(--color-line)', background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/reserver" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-gold)' }}>
              <Hotel className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-ink)' }}>OTELA</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/ma-reservation" className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
              Ma réservation
            </Link>
            <Link href="/login" className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
              Espace professionnel
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="py-6 text-center text-xs" style={{ color: 'var(--color-ink-3)' }}>
        OTELA · Chaîne hôtelière haïtienne · Haitech Solutions
      </footer>
    </div>
  );
}
