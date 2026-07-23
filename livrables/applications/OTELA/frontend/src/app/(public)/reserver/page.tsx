import { Suspense } from 'react';
import type { Metadata } from 'next';
import ReserverClient from './ReserverClient';

export const metadata: Metadata = {
  title: 'Réserver — OTELA, chaîne hôtelière haïtienne',
  description: 'Réservez en ligne dans l\'un des établissements OTELA à travers Haïti. Tarifs transparents en HTG ou USD, confirmation immédiate.',
};

export default function ReserverPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-sm text-center">Chargement...</div>}>
      <ReserverClient />
    </Suspense>
  );
}
