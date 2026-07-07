'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { formatMoney, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/lib/format';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  currency: string;
  buyerName: string;
  buyerEmail: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    api.get('/orders', { params: filter ? { status: filter } : {} }).then((r) => setOrders(r.data.data.orders));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Commandes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input" style={{ width: 220 }}>
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full table-shell">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Total</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="font-semibold">{o.orderNumber}</td>
                <td>
                  <div>{o.buyerName}</div>
                  <div className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{o.buyerEmail}</div>
                </td>
                <td><Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></td>
                <td>{formatMoney(o.total, o.currency)}</td>
                <td>{formatDate(o.createdAt)}</td>
                <td>
                  <Link href={`/dashboard/orders/${o.id}`} className="text-sm font-semibold" style={{ color: 'var(--color-primary-2)' }}>
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucune commande</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
