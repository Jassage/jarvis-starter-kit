'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { agenciesApi } from '@/lib/api';
import { Search, CheckCircle2, Users, Home } from 'lucide-react';

export default function AgenciesPage() {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['agencies', search],
    queryFn: () => agenciesApi.getAll(search ? { q: search } : undefined),
  });

  const agencies = data?.data?.agencies || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Agences immobilières</h1>
        <p className="text-gray-500">Trouvez les meilleures agences partenaires en Haïti</p>
      </div>

      {/* Recherche */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearch(q)}
          placeholder="Rechercher une agence..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <button
          onClick={() => setSearch(q)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600"
        >
          OK
        </button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : agencies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏢</div>
          <p className="text-gray-500">Aucune agence trouvée</p>
          {search && (
            <button onClick={() => { setQ(''); setSearch(''); }} className="mt-3 text-primary-500 text-sm hover:underline">
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agencies.map((agency: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            isVerified: boolean;
            phone: string | null;
            email: string | null;
            _count: { listings: number; members: number };
          }) => (
            <Link
              key={agency.id}
              href={`/agencies/${agency.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center shrink-0 overflow-hidden">
                  {agency.logo ? (
                    <img src={agency.logo} alt={agency.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-navy-500">{agency.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-500 transition-colors">
                      {agency.name}
                    </h3>
                    {agency.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                    )}
                  </div>
                  {agency.email && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{agency.email}</p>
                  )}
                </div>
              </div>

              {agency.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{agency.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" />
                  {agency._count.listings} annonce{agency._count.listings !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {agency._count.members} agent{agency._count.members !== 1 ? 's' : ''}
                </div>
                {agency.isVerified && (
                  <span className="ml-auto text-primary-500 font-medium">Vérifiée</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
