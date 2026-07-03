'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LayoutGrid, Map as MapIcon, Loader2 } from 'lucide-react';
import { SearchBar } from '../../../components/search/SearchBar';
import { FilterPanel, Filters } from '../../../components/search/FilterPanel';
import { PropertyCard } from '../../../components/properties/PropertyCard';
import { searchApi } from '../../../lib/api';
import { cn } from '../../../lib/utils';

const DEFAULT_FILTERS: Filters = {
  propertyTypes: [],
  department: '',
  minPrice: '',
  maxPrice: '',
  currency: 'HTG',
  minBedrooms: '',
  amenities: {},
  sortBy: '',
};

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedParams, setAppliedParams] = useState<Record<string, string>>({});

  // Init depuis URL
  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => { params[key] = value; });
    setAppliedParams(params);

    setFilters((prev) => ({
      ...prev,
      department: params.department || '',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
      currency: (params.currency as 'HTG' | 'USD') || 'HTG',
      minBedrooms: params.minBedrooms || '',
      sortBy: params.sortBy || '',
      propertyTypes: params.propertyType ? [params.propertyType] : [],
    }));
  }, [searchParams]);

  const buildQueryParams = useCallback(() => {
    const params: Record<string, string> = { ...appliedParams };
    if (filters.propertyTypes.length) params.propertyType = filters.propertyTypes.join(',');
    if (filters.department) params.department = filters.department;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.currency) params.currency = filters.currency;
    if (filters.minBedrooms) params.minBedrooms = filters.minBedrooms;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    Object.entries(filters.amenities).forEach(([k, v]) => { if (v) params[k] = 'true'; });
    return params;
  }, [filters, appliedParams]);

  const {
    data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', appliedParams],
    queryFn: ({ pageParam }) =>
      searchApi.search(pageParam ? { ...appliedParams, cursor: pageParam } : appliedParams).then((r) => r.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const p = lastPage?.meta?.pagination as { nextCursor?: string | null } | undefined;
      return p?.nextCursor ?? undefined;
    },
    staleTime: 60 * 1000,
  });

  const listings = data?.pages.flatMap((p) => p.data) || [];
  const pagination = data?.pages[0]?.meta?.pagination as { total?: number } | undefined;

  const applyFilters = () => {
    const params = buildQueryParams();
    setAppliedParams(params);
    const urlParams = new URLSearchParams(params);
    router.push(`/properties?${urlParams.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    const preserved: Record<string, string> = {};
    if (appliedParams.q) preserved.q = appliedParams.q;
    if (appliedParams.listingType) preserved.listingType = appliedParams.listingType;
    setAppliedParams(preserved);
    router.push(`/properties?${new URLSearchParams(preserved).toString()}`, { scroll: false });
  };

  const listingType = appliedParams.listingType as 'RENT' | 'SALE' | undefined;
  const currentQ = appliedParams.q || '';

  return (
    <div className="bg-gray-50">
      {/* Barre de recherche sticky */}
      <div className="bg-white border-b border-gray-100 py-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar defaultValue={currentQ} defaultType={listingType || 'RENT'} />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex gap-6">
          {/* Sidebar filtres (desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterPanel
              filters={filters}
              onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
              onApply={applyFilters}
              onReset={resetFilters}
              totalResults={pagination?.total}
            />
          </aside>

          {/* Résultats */}
          <div className="flex-1 min-w-0">
            {/* Entête résultats */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display font-bold text-gray-900 text-lg">
                  {listingType === 'RENT' ? 'Biens à louer' : listingType === 'SALE' ? 'Biens à vendre' : 'Annonces'}
                  {currentQ && <span className="text-primary-500"> · "{currentQ}"</span>}
                </h1>
                {pagination?.total !== undefined && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Filtres mobile */}
              <div className="flex items-center gap-2">
                <button
                  className="lg:hidden text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => {/* Ouvrir drawer filtres */}}
                >
                  Filtres
                </button>

                {/* Vue grille/carte */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn('p-2', viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={cn('p-2', viewMode === 'map' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600')}
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                      <div className="h-3 bg-gray-200 rounded w-3/5" />
                      <div className="h-5 bg-gray-200 rounded w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="font-semibold text-gray-600 mb-2">Aucune annonce trouvée</h3>
                <p className="text-sm">Essayez d'élargir vos critères de recherche</p>
                <button onClick={resetFilters} className="mt-4 text-primary-500 text-sm font-medium hover:underline">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                {isFetching && !isLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mise à jour...
                  </div>
                )}

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {listings.map((listing: Parameters<typeof PropertyCard>[0]['listing']) => (
                    <PropertyCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Charger plus (scroll infini par curseur) */}
                {hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 disabled:opacity-50 transition-colors"
                    >
                      {isFetchingNextPage ? <><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</> : 'Charger plus d\'annonces'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
