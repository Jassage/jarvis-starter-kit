'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Payment } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

export default function PaymentsPage() {
  const router = useRouter();
  const { utilisateur, chargement: chargementAuth } = useAuthStore();
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    if (!chargementAuth && utilisateur && utilisateur.role !== 'SUPER_ADMIN') {
      router.replace('/app');
    }
  }, [chargementAuth, utilisateur, router]);

  async function charger() {
    const { data } = await api.get('/billing/admin/payments');
    setPayments(data.data.payments);
  }

  useEffect(() => {
    if (utilisateur?.role === 'SUPER_ADMIN') charger();
  }, [utilisateur]);

  async function approuver(p: Payment) {
    await api.post(`/billing/admin/payments/${p.id}/approve`);
    await charger();
  }

  async function rejeter(p: Payment) {
    if (!confirm('Rejeter ce paiement ?')) return;
    await api.post(`/billing/admin/payments/${p.id}/reject`);
    await charger();
  }

  if (chargementAuth || utilisateur?.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Paiements MonCash en attente</h1>
        <p className="text-sm text-neutral-500">Validez ou rejetez les preuves de paiement soumises par les clients.</p>
      </div>

      <div className="overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {payments?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                  Aucun paiement en attente.
                </td>
              </tr>
            )}
            {payments?.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">
                  {p.subscription ? `${p.subscription.user.prenom} ${p.subscription.user.nom}` : '—'}
                </td>
                <td className="px-4 py-3">{p.plan}</td>
                <td className="px-4 py-3">{p.montantHtg} HTG</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {p.referenceTransaction || <span className="text-neutral-400">Non fournie</span>}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => approuver(p)}
                      className="text-green-700 underline underline-offset-2 hover:text-green-900"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => rejeter(p)}
                      className="text-red-600 underline underline-offset-2 hover:text-red-800"
                    >
                      Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
