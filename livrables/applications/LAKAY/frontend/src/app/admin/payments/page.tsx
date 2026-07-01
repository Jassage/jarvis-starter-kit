'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: () => adminApi.getStats(),
  });

  const stats = data?.data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Paiements & Abonnements</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Utilisateurs totaux', value: stats?.users?.total ?? 0 },
            { label: 'Annonces actives', value: stats?.listings?.active ?? 0 },
            { label: 'Agences vérifiées', value: stats?.agencies?.verified ?? 0 },
            { label: 'Signalements en attente', value: stats?.reports?.pending ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">💳</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Module paiements</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          L'intégration MonCash et Stripe est prévue dans la phase suivante.
          Les transactions apparaîtront ici une fois les passerelles de paiement configurées.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {['MonCash', 'Stripe', 'Virement bancaire'].map(m => (
            <span key={m} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg font-medium">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
