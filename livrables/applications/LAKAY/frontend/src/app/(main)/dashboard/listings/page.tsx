'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { format, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RefreshCw } from 'lucide-react';

function ExpiryCell({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return <span className="text-gray-400">—</span>;
  const date = new Date(expiresAt);
  const daysLeft = differenceInDays(date, new Date());
  const expired = isPast(date);

  if (expired) {
    return <span className="text-red-600 font-medium text-xs">Expirée</span>;
  }
  if (daysLeft <= 7) {
    return (
      <span className="text-orange-500 font-medium text-xs">
        {daysLeft}j restant{daysLeft > 1 ? 's' : ''}
      </span>
    );
  }
  return <span className="text-gray-500 text-sm">{format(date, 'd MMM yyyy', { locale: fr })}</span>;
}

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

const LISTING_TYPE_LABELS: Record<string, string> = {
  RENT: 'Location',
  SALE: 'Vente',
};

export default function MyListingsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings', filter, page],
    queryFn: () => listingsApi.getMyListings({
      status: filter === 'ALL' ? undefined : filter,
      page,
      limit: 10,
    }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => listingsApi.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => listingsApi.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => listingsApi.renew(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Supprimer l'annonce "${title}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(id);
    }
  };

  // r.data = corps API = { success, data: [...listings], meta: { pagination } }
  const listings = data?.data || [];
  const pagination = data?.meta?.pagination;

  const statusFilters = ['ALL', 'ACTIVE', 'DRAFT', 'PENDING_REVIEW', 'EXPIRED', 'REJECTED'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination?.total ?? 0} annonce{(pagination?.total ?? 0) > 1 ? 's' : ''} au total
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle annonce
        </Link>
      </div>

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'ALL' ? 'Toutes' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune annonce</h3>
          <p className="text-gray-500 text-sm mb-6">
            {filter === 'ALL' ? "Tu n'as pas encore publié d'annonce." : `Aucune annonce avec le statut "${STATUS_CONFIG[filter]?.label}".`}
          </p>
          <Link href="/dashboard/listings/new" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Créer une annonce
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Annonce</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Vues</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Favoris</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Expiration</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((listing: {
                id: string;
                title: string;
                city: string;
                listingType: string;
                status: string;
                viewCount: number;
                favoriteCount: number;
                expiresAt: string | null;
                images: Array<{ url: string }>;
              }) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {listing.images?.[0] ? (
                          <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">{listing.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{listing.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${listing.listingType === 'RENT' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {LISTING_TYPE_LABELS[listing.listingType]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_CONFIG[listing.status]?.color}`}>
                      {STATUS_CONFIG[listing.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    {listing.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">
                    <span className={listing.favoriteCount > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>
                      ♥ {listing.favoriteCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <ExpiryCell expiresAt={listing.expiresAt} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/properties/${listing.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="Voir"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/dashboard/listings/${listing.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      {listing.status === 'DRAFT' && (
                        <button
                          onClick={() => submitMutation.mutate(listing.id)}
                          disabled={submitMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                          title="Soumettre pour révision"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      {(listing.status === 'EXPIRED' ||
                        (listing.status === 'ACTIVE' && listing.expiresAt && differenceInDays(new Date(listing.expiresAt), new Date()) <= 7)) && (
                        <button
                          onClick={() => renewMutation.mutate(listing.id)}
                          disabled={renewMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                          title="Renouveler"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(listing.id, listing.title)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {pagination.page} sur {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.pages}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
