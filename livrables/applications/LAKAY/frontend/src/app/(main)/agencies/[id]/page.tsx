'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { agenciesApi } from '@/lib/api';
import { CheckCircle2, Phone, Mail, Users, Home } from 'lucide-react';
import { PropertyCard } from '@/components/properties/PropertyCard';

export default function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: agencyData, isLoading } = useQuery({
    queryKey: ['agency', id],
    queryFn: () => agenciesApi.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const agency = agencyData?.data?.data?.agency;
  if (!agency) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-3">Agence introuvable</p>
        <Link href="/agencies" className="text-primary-500 hover:underline">← Retour aux agences</Link>
      </div>
    );
  }

  const listings = agency.listings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary-500">Accueil</Link>
        <span>/</span>
        <Link href="/agencies" className="hover:text-primary-500">Agences</Link>
        <span>/</span>
        <span className="text-gray-600">{agency.name}</span>
      </nav>

      {/* En-tête agence */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-navy-50 flex items-center justify-center shrink-0 overflow-hidden">
            {agency.logo ? (
              <img src={agency.logo} alt={agency.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-navy-500">{agency.name[0]}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-display font-bold text-gray-900">{agency.name}</h1>
              {agency.isVerified && (
                <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Vérifiée
                </span>
              )}
            </div>
            {agency.description && (
              <p className="text-gray-500 text-sm mt-1 max-w-xl">{agency.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3">
              {agency._count && (
                <>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Home className="w-4 h-4 text-primary-500" />
                    {agency._count.listings} annonce{agency._count.listings !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users className="w-4 h-4 text-primary-500" />
                    {agency._count.members} agent{agency._count.members !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {agency.phone && (
              <a href={`tel:${agency.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500">
                <Phone className="w-4 h-4" />
                {agency.phone}
              </a>
            )}
            {agency.email && (
              <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500">
                <Mail className="w-4 h-4" />
                {agency.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Annonces de l'agence */}
      {listings.length > 0 && (
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-5">
            Annonces de {agency.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing: Parameters<typeof PropertyCard>[0]['listing']) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
          {agency._count?.listings > 6 && (
            <div className="text-center mt-6">
              <Link
                href={`/properties?agencyId=${agency.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Voir toutes les annonces ({agency._count.listings})
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
