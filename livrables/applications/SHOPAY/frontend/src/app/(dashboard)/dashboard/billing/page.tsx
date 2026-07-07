'use client';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import api from '@/lib/api';
import { formatMoney } from '@/lib/format';

interface PlanLimits { label: string; maxProducts: number; priceHtg: number; priceUsd: number }
interface Overview { plan: string; expiresAt: string | null; limits: PlanLimits; usage: { products: number } }

export default function BillingPage() {
  const [plans, setPlans] = useState<Record<string, PlanLimits> | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [proofPlan, setProofPlan] = useState<string | null>(null);
  const [proofRef, setProofRef] = useState('');
  const [proofSent, setProofSent] = useState(false);

  useEffect(() => {
    api.get('/billing/plans').then((r) => setPlans(r.data.data.plans));
    api.get('/billing/me').then((r) => setOverview(r.data.data));
  }, []);

  const handleUpgrade = async (plan: string, method: 'STRIPE' | 'MONCASH') => {
    setError('');
    try {
      const { data } = await api.post('/billing/upgrade', { plan, method });
      if (data.data.url) window.location.href = data.data.url;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Paiement indisponible pour l'instant");
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofPlan) return;
    setError('');
    try {
      await api.post('/billing/submit-proof', { plan: proofPlan, transactionRef: proofRef });
      setProofSent(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Impossible de soumettre la preuve');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Abonnement</h1>
        {overview && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>
            Plan actuel : <strong>{overview.plan}</strong> · {overview.usage.products}/{overview.limits.maxProducts === Infinity ? '∞' : overview.limits.maxProducts} produits utilisés
            {overview.expiresAt && ` · Expire le ${new Date(overview.expiresAt).toLocaleDateString('fr-FR')}`}
          </p>
        )}
      </div>

      {error && <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="grid sm:grid-cols-3 gap-5">
        {plans && Object.entries(plans).map(([key, p]) => (
          <div key={key} className="card p-6" style={{ border: overview?.plan === key ? '2px solid var(--color-primary-2)' : undefined }}>
            <h3 className="font-extrabold text-lg mb-1">{p.label}</h3>
            <p className="text-2xl font-extrabold mb-4">{p.priceHtg === 0 ? 'Gratuit' : formatMoney(p.priceHtg)}<span className="text-sm font-medium" style={{ color: 'var(--color-ink-3)' }}> /mois</span></p>
            <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-ink-2)' }}>
              <Check className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              {p.maxProducts === Infinity ? 'Produits illimités' : `Jusqu'à ${p.maxProducts} produits`}
            </div>
            {key !== 'FREE' && overview?.plan !== key && (
              <div className="space-y-2">
                <button onClick={() => handleUpgrade(key, 'STRIPE')} className="btn btn-primary w-full">Payer par carte</button>
                <button onClick={() => handleUpgrade(key, 'MONCASH')} className="btn btn-secondary w-full">Payer par MonCash</button>
                <button onClick={() => setProofPlan(key)} className="text-xs font-semibold w-full text-center pt-1" style={{ color: 'var(--color-primary-2)' }}>
                  J&apos;ai déjà payé, soumettre une preuve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {proofPlan && !proofSent && (
        <form onSubmit={handleSubmitProof} className="card p-6 max-w-md space-y-3">
          <h3 className="font-bold">Soumettre une preuve de paiement — plan {proofPlan}</h3>
          <input required value={proofRef} onChange={(e) => setProofRef(e.target.value)} placeholder="Référence de transaction" className="input" />
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary">Envoyer</button>
            <button type="button" onClick={() => setProofPlan(null)} className="btn btn-secondary">Annuler</button>
          </div>
        </form>
      )}
      {proofSent && (
        <div className="text-sm p-4 rounded-xl font-medium max-w-md" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
          Preuve reçue. Votre plan sera activé après vérification par un administrateur (sous 24h).
        </div>
      )}
    </div>
  );
}
