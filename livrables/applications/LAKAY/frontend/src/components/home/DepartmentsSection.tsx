'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { api } from '../../lib/api';

const DEPARTMENTS = [
  { value: 'OUEST',      label: 'Ouest',       city: 'Port-au-Prince' },
  { value: 'NORD',       label: 'Nord',         city: 'Cap-Haïtien' },
  { value: 'ARTIBONITE', label: 'Artibonite',   city: 'Gonaïves' },
  { value: 'SUD',        label: 'Sud',          city: 'Les Cayes' },
  { value: 'NORD_OUEST', label: 'Nord-Ouest',   city: 'Port-de-Paix' },
  { value: 'NORD_EST',   label: 'Nord-Est',     city: 'Fort-Liberté' },
  { value: 'CENTRE',     label: 'Centre',       city: 'Hinche' },
  { value: 'NIPPES',     label: 'Nippes',       city: 'Miragoâne' },
  { value: 'SUD_EST',    label: 'Sud-Est',      city: 'Jacmel' },
  { value: 'GRANDE_ANSE',label: 'Grande-Anse',  city: 'Jérémie' },
];

interface StatsData {
  departmentCounts: Record<string, number>;
}

function formatCount(n: number): string {
  if (n === 0) return 'Aucune annonce';
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')} 000+ annonces`;
  return `${n}+ annonce${n > 1 ? 's' : ''}`;
}

export function DepartmentsSection() {
  const { data } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/stats').then((r) => r.data.data as StatsData),
    staleTime: 5 * 60 * 1000,
  });

  const counts = data?.departmentCounts ?? {};

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-primary-500 text-sm font-semibold uppercase tracking-wide mb-1">Partout en Haïti</p>
          <h2 className="text-2xl font-display font-bold text-gray-900">Explorer par département</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {DEPARTMENTS.map((dep) => {
            const count = counts[dep.value] ?? 0;
            const hasListings = count > 0;
            return (
              <Link
                key={dep.value}
                href={`/properties?department=${dep.value}`}
                className={`relative overflow-hidden rounded-2xl text-white p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group ${
                  hasListings
                    ? 'bg-gradient-to-br from-navy-600 to-navy-800'
                    : 'bg-gradient-to-br from-gray-500 to-gray-700 opacity-70 hover:opacity-90'
                }`}
              >
                <div className="absolute -top-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-200">
                  <MapPin className="w-20 h-20" />
                </div>
                <p className="font-bold text-base font-display leading-tight">{dep.label}</p>
                <p className="text-white/60 text-xs mb-3">{dep.city}</p>
                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${
                  hasListings ? 'bg-white/15 text-white/90' : 'bg-white/10 text-white/60'
                }`}>
                  {data ? formatCount(count) : '…'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
