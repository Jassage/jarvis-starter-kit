'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Link from 'next/link';

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-200 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  });

  const stats = data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble de la plateforme</p>
      </div>

      {/* KPIs utilisateurs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Utilisateurs</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total utilisateurs" value={stats?.users?.total ?? 0} color="border-l-blue-500" />
          <KpiCard label="Actifs" value={stats?.users?.active ?? 0} color="border-l-green-500" />
          <KpiCard label="Nouveaux ce mois" value={stats?.users?.newThisMonth ?? 0} sub="derniers 30 jours" color="border-l-purple-500" />
          <KpiCard label="Agences" value={stats?.users?.agencies ?? 0} color="border-l-yellow-500" />
        </div>
      </div>

      {/* KPIs annonces */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Annonces</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total annonces" value={stats?.listings?.total ?? 0} color="border-l-blue-500" />
          <KpiCard label="Actives" value={stats?.listings?.active ?? 0} color="border-l-green-500" />
          <KpiCard label="En révision" value={stats?.listings?.pending ?? 0} color="border-l-orange-500" />
          <KpiCard label="Vues totales" value={(stats?.listings?.totalViews ?? 0).toLocaleString()} color="border-l-cyan-500" />
        </div>
      </div>

      {/* KPIs opérationnels */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Opérationnel</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Abonnements actifs" value={stats?.subscriptions?.active ?? 0} color="border-l-purple-500" />
          <KpiCard label="Signalements ouverts" value={stats?.reports?.open ?? 0} color="border-l-red-500" />
          <KpiCard label="Annonces expirées" value={stats?.listings?.expired ?? 0} color="border-l-gray-400" />
          <KpiCard label="Agences vérifiées" value={stats?.agencies?.verified ?? 0} color="border-l-teal-500" />
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/listings?status=PENDING_REVIEW', label: 'Annonces en attente', count: stats?.listings?.pending, color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { href: '/admin/reports?status=OPEN', label: 'Signalements à traiter', count: stats?.reports?.open, color: 'bg-red-50 border-red-200 text-red-700' },
          { href: '/admin/users', label: 'Gérer les utilisateurs', count: stats?.users?.total, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { href: '/admin/config', label: 'Configuration', count: null, color: 'bg-gray-50 border-gray-200 text-gray-700' },
        ].map(action => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center justify-between p-4 rounded-2xl border ${action.color} hover:opacity-80 transition-opacity`}
          >
            <span className="font-medium text-sm">{action.label}</span>
            {action.count != null && (
              <span className="text-lg font-bold">{action.count}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
