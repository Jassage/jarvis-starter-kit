'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
  PENDING_REVIEW: { label: 'En révision', color: 'bg-yellow-100 text-yellow-700' },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  RENTED: { label: 'Louée', color: 'bg-blue-100 text-blue-700' },
  SOLD: { label: 'Vendue', color: 'bg-purple-100 text-purple-700' },
  EXPIRED: { label: 'Expirée', color: 'bg-gray-100 text-gray-500' },
  SUSPENDED: { label: 'Suspendue', color: 'bg-orange-100 text-orange-700' },
};

export default function AdminListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', page, status, search],
    queryFn: () => adminApi.getListings({ page, limit: 20, status: status || undefined }).then(r => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'APPROVE' | 'REJECT'; reason?: string }) =>
      adminApi.reviewListing(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    },
  });

  const listings = data?.data?.listings || [];
  const pagination = data?.meta?.pagination;

  const handleReject = (id: string) => {
    const reason = prompt('Raison du rejet (optionnel) :');
    if (reason === null) return;
    reviewMutation.mutate({ id, action: 'REJECT', reason: reason || undefined });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Annonces</h1>
        <span className="text-sm text-gray-500">{pagination?.total ?? 0} au total</span>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher..."
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm w-48 focus:outline-none focus:border-primary"
        />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : listings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucune annonce trouvée.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Annonce</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Propriétaire</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((listing: {
                id: string;
                title: string;
                city: string;
                status: string;
                viewCount: number;
                createdAt: string;
                owner: { firstName: string; lastName: string; email: string };
              }) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/properties/${listing.id}`} target="_blank" className="font-medium text-gray-900 text-sm hover:text-primary line-clamp-1">
                      {listing.title}
                    </Link>
                    <p className="text-xs text-gray-500">{listing.city} · {listing.viewCount} vues</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-gray-900">{listing.owner.firstName} {listing.owner.lastName}</p>
                    <p className="text-xs text-gray-500">{listing.owner.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_CONFIG[listing.status]?.color}`}>
                      {STATUS_CONFIG[listing.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    {format(new Date(listing.createdAt), 'd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {listing.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            onClick={() => reviewMutation.mutate({ id: listing.id, action: 'APPROVE' })}
                            className="px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleReject(listing.id)}
                            className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                      {listing.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            if (confirm('Suspendre cette annonce ?')) suspendMutation.mutate(listing.id);
                          }}
                          className="px-2.5 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600"
                        >
                          Suspendre
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} / {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Précédent
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
