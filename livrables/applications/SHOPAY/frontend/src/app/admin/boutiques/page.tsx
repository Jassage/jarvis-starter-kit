'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';

interface Boutique {
  id: string;
  name: string;
  slug: string;
  status: string;
  merchantSubscription: { plan: string } | null;
  _count: { products: number; orders: number };
  createdAt: string;
}

const STATUS_TONE: Record<string, 'success' | 'danger' | 'warning'> = { ACTIVE: 'success', SUSPENDED: 'danger', PENDING_SETUP: 'warning' };
const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Active', SUSPENDED: 'Suspendue', PENDING_SETUP: 'En attente' };

export default function AdminBoutiquesPage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);

  const load = () => {
    api.get('/admin/boutiques').then((r) => setBoutiques(r.data.data.boutiques));
  };

  useEffect(load, []);

  const toggleStatus = async (id: string, current: string) => {
    await api.patch(`/admin/boutiques/${id}/status`, { status: current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Boutiques</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>{boutiques.length} boutique{boutiques.length > 1 ? 's' : ''} sur la plateforme</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full table-shell">
          <thead>
            <tr>
              <th>Boutique</th>
              <th>Plan</th>
              <th>Produits</th>
              <th>Commandes</th>
              <th>Statut</th>
              <th>Créée le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {boutiques.map((b) => (
              <tr key={b.id}>
                <td>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs" style={{ color: 'var(--color-ink-3)' }}>/store/{b.slug}</div>
                </td>
                <td>{b.merchantSubscription?.plan ?? '—'}</td>
                <td>{b._count.products}</td>
                <td>{b._count.orders}</td>
                <td><Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge></td>
                <td>{formatDate(b.createdAt)}</td>
                <td>
                  <button onClick={() => toggleStatus(b.id, b.status)} className={b.status === 'ACTIVE' ? 'btn btn-danger' : 'btn btn-primary'} style={{ padding: '0.4rem 0.8rem' }}>
                    {b.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
            {boutiques.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucune boutique pour l&apos;instant</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
