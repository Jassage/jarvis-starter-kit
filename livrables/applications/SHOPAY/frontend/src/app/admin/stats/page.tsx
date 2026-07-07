'use client';
import { useEffect, useState } from 'react';
import { Building2, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import api from '@/lib/api';
import StatCard from '@/components/ui/StatCard';

interface Stats {
  boutiquesCount: number;
  activeBoutiques: number;
  ordersCount: number;
  paidOrders: number;
  pendingProofs: number;
  revenueByPlan: { plan: string; _count: { plan: number } }[];
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data.data));
  }, []);

  if (!stats) return <p style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Statistiques plateforme</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Boutiques" value={stats.boutiquesCount} icon={Building2} hint={`${stats.activeBoutiques} actives`} />
        <StatCard label="Commandes" value={stats.ordersCount} icon={ShoppingBag} hint={`${stats.paidOrders} payées`} />
        <StatCard label="Preuves en attente" value={stats.pendingProofs} icon={Clock} />
        <StatCard label="Répartition des plans" value={stats.revenueByPlan.length} icon={TrendingUp} />
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4">Répartition par plan</h2>
        <div className="space-y-2">
          {stats.revenueByPlan.map((r) => (
            <div key={r.plan} className="flex items-center justify-between text-sm">
              <span className="font-semibold">{r.plan}</span>
              <span style={{ color: 'var(--color-ink-2)' }}>{r._count.plan} boutique{r._count.plan > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
