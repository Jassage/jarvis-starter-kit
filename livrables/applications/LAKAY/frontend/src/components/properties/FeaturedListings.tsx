'use client';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../../lib/api';
import { PropertyCard, PropertyCardData } from './PropertyCard';
import { Loader2 } from 'lucide-react';

export function FeaturedListings() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => listingsApi.getFeatured().then((r) => r.data.data.listings as PropertyCardData[]),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-52 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Aucune annonce vedette disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((listing) => (
        <PropertyCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
