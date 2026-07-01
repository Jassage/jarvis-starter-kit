'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface PublicStats {
  activeListings: number;
  agencies: number;
  departments: number;
}

function fmt(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`.replace('.', ' ');
  return `${n}+`;
}

export function HeroStats() {
  const { data } = useQuery<PublicStats>({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/stats').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const items = [
    { value: data ? fmt(data.activeListings) : '2 000+', label: 'Annonces actives' },
    { value: data ? `${data.agencies}+` : '150+', label: 'Agences partenaires' },
    { value: data ? `${data.departments}` : '10', label: 'Départements couverts' },
  ];

  return (
    <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-300">
      {items.map((stat) => (
        <div key={stat.label}>
          <span className="font-bold text-white text-xl block">{stat.value}</span>
          {stat.label}
        </div>
      ))}
    </div>
  );
}
