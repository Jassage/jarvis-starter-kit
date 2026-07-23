import { Suspense } from 'react';
import type { Metadata } from 'next';
import MaReservationClient from './MaReservationClient';

// Page de consultation privée (référence + email) — ne doit jamais être indexée.
export const metadata: Metadata = {
  title: 'Ma réservation — OTELA',
  robots: { index: false, follow: false },
};

export default function MaReservationPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-10 text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>}>
      <MaReservationClient />
    </Suspense>
  );
}
