'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMoney, formatDate } from '@/lib/format';

interface Payment {
  id: string;
  purpose: string;
  amount: string;
  currency: string;
  method: string;
  boutique: { name: string; slug: string } | null;
  order: { orderNumber: string } | null;
  metadata: { plan?: string; proof?: { transactionRef: string; senderName?: string; imageUrl?: string } } | null;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});

  const load = () => {
    api.get('/admin/payments').then((r) => setPayments(r.data.data.payments));
  };

  useEffect(load, []);

  const approve = async (id: string) => {
    await api.post(`/admin/payments/${id}/approve`);
    load();
  };

  const reject = async (id: string) => {
    await api.post(`/admin/payments/${id}/reject`, { reason: reason[id] });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Preuves de paiement en attente</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>{payments.length} en attente de validation</p>
      </div>

      <div className="space-y-4">
        {payments.map((p) => (
          <div key={p.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="font-bold">
                {p.purpose === 'ORDER' ? `Commande ${p.order?.orderNumber ?? ''}` : `Abonnement ${p.metadata?.plan ?? ''}`}
                {' — '}{p.boutique?.name ?? 'Plateforme'}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                {formatMoney(p.amount, p.currency)} · {p.method} · {formatDate(p.createdAt)}
              </p>
              {p.metadata?.proof && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>
                  Réf: {p.metadata.proof.transactionRef} {p.metadata.proof.senderName && `· ${p.metadata.proof.senderName}`}
                </p>
              )}
              {p.metadata?.proof?.imageUrl && (
                <a href={p.metadata.proof.imageUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>
                  Voir la capture
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="Motif de rejet (optionnel)"
                value={reason[p.id] ?? ''}
                onChange={(e) => setReason({ ...reason, [p.id]: e.target.value })}
                className="input"
                style={{ width: 200 }}
              />
              <button onClick={() => approve(p.id)} className="btn btn-primary">Valider</button>
              <button onClick={() => reject(p.id)} className="btn btn-danger">Rejeter</button>
            </div>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="card p-8 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucune preuve en attente</div>
        )}
      </div>
    </div>
  );
}
