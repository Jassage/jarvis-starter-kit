'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { formatMoney, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/lib/format';

interface OrderItem {
  id: string;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  currency: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  department?: string;
  commune?: string;
  landmark?: string;
  createdAt: string;
  items: OrderItem[];
  payments: { id: string; method: string; status: string; createdAt: string }[];
}

const TRANSITIONS: Record<string, string[]> = {
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  const load = () => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.data.order));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  if (!order) return <p style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;

  const allowed = TRANSITIONS[order.status] ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>{formatDate(order.createdAt)}</p>
        </div>
        <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
      </div>

      {allowed.length > 0 && (
        <div className="flex gap-2">
          {allowed.map((s) => (
            <button key={s} onClick={() => updateStatus(s)} className={s === 'CANCELLED' ? 'btn btn-danger' : 'btn btn-primary'}>
              {ORDER_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-bold mb-3">Client</h2>
        <p className="text-sm">{order.buyerName} · {order.buyerEmail} · {order.buyerPhone}</p>
        {(order.department || order.commune || order.landmark) && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-2)' }}>
            {[order.department, order.commune, order.landmark].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      <div className="card">
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-line)' }}>
          <h2 className="font-bold">Articles</h2>
        </div>
        <table className="w-full table-shell">
          <thead><tr><th>Produit</th><th>Qté</th><th>Prix unitaire</th><th>Sous-total</th></tr></thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id}>
                <td>{it.productNameSnapshot}</td>
                <td>{it.quantity}</td>
                <td>{formatMoney(it.unitPrice, order.currency)}</td>
                <td>{formatMoney(Number(it.unitPrice) * it.quantity, order.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-5 space-y-1 text-sm border-t" style={{ borderColor: 'var(--color-line)' }}>
          <div className="flex justify-between"><span style={{ color: 'var(--color-ink-3)' }}>Sous-total</span><span>{formatMoney(order.subtotal, order.currency)}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--color-ink-3)' }}>Livraison</span><span>{formatMoney(order.shippingFee, order.currency)}</span></div>
          <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>{formatMoney(order.total, order.currency)}</span></div>
        </div>
      </div>

      {order.payments.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold mb-3">Paiements</h2>
          <div className="space-y-2">
            {order.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.method} · {formatDate(p.createdAt)}</span>
                <Badge tone={p.status === 'COMPLETED' ? 'success' : p.status === 'FAILED' ? 'danger' : 'warning'}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
