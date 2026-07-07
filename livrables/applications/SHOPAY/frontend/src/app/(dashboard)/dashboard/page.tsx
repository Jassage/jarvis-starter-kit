'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, Wallet, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { formatMoney, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/lib/format';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  currency: string;
  buyerName: string;
  createdAt: string;
}

export default function DashboardHomePage() {
  const { boutique } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [plan, setPlan] = useState<{ plan: string; usage: { products: number }; limits: { maxProducts: number } } | null>(null);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data.data.orders));
    api.get('/products').then((r) => setProductCount(r.data.data.products.length));
    api.get('/billing/me').then((r) => setPlan(r.data.data));
  }, []);

  const paidOrders = orders.filter((o) => o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED');
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Tableau de bord</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>
          {boutique?.name} · {boutique?.status === 'ACTIVE' ? 'Boutique active' : 'Boutique non publiée'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Commandes" value={orders.length} icon={ShoppingBag} />
        <StatCard label="Revenu (commandes payées)" value={formatMoney(revenue)} icon={Wallet} />
        <StatCard label="Produits" value={productCount} icon={Package} hint={plan ? `Plan ${plan.plan} · ${plan.usage.products}/${plan.limits.maxProducts === Infinity ? '∞' : plan.limits.maxProducts}` : undefined} />
        <StatCard label="Plan actuel" value={plan?.plan ?? '—'} icon={TrendingUp} />
      </div>

      <div className="card">
        <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-line)' }}>
          <h2 className="font-bold">Commandes récentes</h2>
          <Link href="/dashboard/orders" className="text-sm font-semibold" style={{ color: 'var(--color-primary-2)' }}>Voir tout</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td className="font-semibold">{o.orderNumber}</td>
                  <td>{o.buyerName}</td>
                  <td><Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></td>
                  <td>{formatMoney(o.total, o.currency)}</td>
                  <td>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucune commande pour l&apos;instant</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
