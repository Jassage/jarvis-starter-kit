'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, ExternalLink, Loader2 } from 'lucide-react';

interface Proof {
  transactionRef?: string;
  senderName?: string | null;
  senderNumber?: string | null;
  note?: string | null;
  imageUrl?: string | null;
}
interface Payment {
  id: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  createdAt: string;
  metadata?: { planId?: string; proof?: Proof } | null;
  user?: { firstName: string; lastName: string; email: string };
}

const STATUS_TABS = ['PENDING', 'COMPLETED', 'FAILED'] as const;
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', COMPLETED: 'Validés', FAILED: 'Rejetés',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('PENDING');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', status],
    queryFn: () => adminApi.getPayments({ status }).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approvePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-payments'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => {
      const reason = prompt('Motif du rejet (optionnel) :') ?? undefined;
      return adminApi.rejectPayment(id, reason);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-payments'] }),
  });

  const payments: Payment[] = data?.data?.payments || [];
  const pendingId = approveMutation.isPending
    ? approveMutation.variables
    : rejectMutation.isPending
      ? rejectMutation.variables
      : null;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Paiements & Abonnements</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-500 text-sm">Aucun paiement {STATUS_LABELS[status].toLowerCase()}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => {
            const proof = p.metadata?.proof;
            const busy = pendingId === p.id;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{p.metadata?.planId ?? '—'}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.method}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {p.user?.firstName} {p.user?.lastName} · <span className="text-gray-400">{p.user?.email}</span>
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {new Intl.NumberFormat('fr-HT').format(Number(p.amount))} {p.currency}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(p.createdAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                    </p>

                    {proof && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-3 text-sm space-y-1 border border-gray-100">
                        <p><span className="text-gray-500">Référence :</span> <strong className="font-mono">{proof.transactionRef}</strong></p>
                        {proof.senderNumber && <p><span className="text-gray-500">Numéro envoi :</span> {proof.senderNumber}</p>}
                        {proof.senderName && <p><span className="text-gray-500">Nom :</span> {proof.senderName}</p>}
                        {proof.imageUrl && (
                          <a href={proof.imageUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary-500 hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" /> Voir la capture
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {p.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveMutation.mutate(p.id)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {busy && approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Valider
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(p.id)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <X className="w-4 h-4" /> Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
