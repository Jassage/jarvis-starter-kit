'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/lib/api';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';

export default function FavoritesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getFavorites().then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (listingId: string) => favoritesApi.removeFavorite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const favorites = data?.data?.favorites || [];

  const PROPERTY_TYPE_LABELS: Record<string, string> = {
    ROOM: 'Chambre', STUDIO: 'Studio', APARTMENT: 'Appartement',
    HOUSE: 'Maison', VILLA: 'Villa', LAND: 'Terrain',
    COMMERCIAL: 'Local commercial', OFFICE: 'Bureau', WAREHOUSE: 'Entrepôt',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
        <p className="text-gray-500 text-sm mt-1">{favorites.length} annonce{favorites.length !== 1 ? 's' : ''} sauvegardée{favorites.length !== 1 ? 's' : ''}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun favori</h3>
          <p className="text-gray-500 text-sm mb-6">Sauvegardez des annonces en cliquant sur le cœur.</p>
          <Link href="/properties" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Parcourir les annonces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((fav: {
            id: string;
            savedPrice: number | null;
            listing: {
              id: string;
              title: string;
              price: number;
              currency: 'HTG' | 'USD';
              city: string;
              propertyType: string;
              listingType: string;
              bedrooms: number | null;
              images: Array<{ url: string }>;
            };
          }) => {
            const priceDrop = fav.savedPrice !== null && Number(fav.listing.price) < Number(fav.savedPrice);
            const dropPct = priceDrop
              ? Math.round(((Number(fav.savedPrice) - Number(fav.listing.price)) / Number(fav.savedPrice)) * 100)
              : 0;

            return (
              <div key={fav.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {fav.listing.images?.[0] ? (
                    <img
                      src={fav.listing.images[0].url}
                      alt={fav.listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${fav.listing.listingType === 'RENT' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                      {fav.listing.listingType === 'RENT' ? 'Location' : 'Vente'}
                    </span>
                    {priceDrop && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-orange-500 text-white">
                        <TrendingDown className="w-3 h-3" />
                        -{dropPct}%
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(fav.listing.id)}
                    disabled={removeMutation.isPending}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    title="Retirer des favoris"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{PROPERTY_TYPE_LABELS[fav.listing.propertyType]} · {fav.listing.city}</p>
                  <Link href={`/properties/${fav.listing.id}`} className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-primary transition-colors">
                    {fav.listing.title}
                  </Link>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="font-bold text-primary">
                        {formatPrice(fav.listing.price, fav.listing.currency)}
                        {fav.listing.listingType === 'RENT' && <span className="text-xs font-normal text-gray-500">/mois</span>}
                      </p>
                      {priceDrop && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(Number(fav.savedPrice), fav.listing.currency)}
                        </p>
                      )}
                    </div>
                    {fav.listing.bedrooms && (
                      <p className="text-xs text-gray-500">{fav.listing.bedrooms} ch.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
