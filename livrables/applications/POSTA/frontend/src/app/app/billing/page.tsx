'use client';

import { useEffect, useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, apiErrorMessage } from '@/lib/api';
import { SubscriptionOverview, PlanLimits, PlanType, MoncashInitiateResult } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

const PLANS_ACHETABLES: PlanType[] = ['STARTER', 'PRO', 'BUSINESS'];

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const illimite = !Number.isFinite(max);
  const pct = illimite ? 0 : Math.min(100, (used / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-500">{illimite ? `${used} / illimité` : `${used} / ${max}`}</span>
      </div>
      {!illimite && (
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : 'bg-neutral-900'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function BillingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { utilisateur, chargement: chargementAuth } = useAuthStore();

  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [plans, setPlans] = useState<Record<PlanType, PlanLimits> | null>(null);
  const [moncash, setMoncash] = useState<MoncashInitiateResult | null>(null);
  const [reference, setReference] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [chargementAction, setChargementAction] = useState<string | null>(null);

  useEffect(() => {
    if (!chargementAuth && utilisateur && utilisateur.role !== 'CLIENT_ADMIN') {
      router.replace('/app');
    }
  }, [chargementAuth, utilisateur, router]);

  async function charger() {
    const [subRes, plansRes] = await Promise.all([api.get('/billing/subscription'), api.get('/billing/plans')]);
    setOverview(subRes.data.data);
    setPlans(plansRes.data.data.plans);
  }

  useEffect(() => {
    if (utilisateur?.role === 'CLIENT_ADMIN') charger();
  }, [utilisateur]);

  useEffect(() => {
    const statut = searchParams.get('paiement');
    if (statut === 'succes') setSucces('Paiement Stripe reçu, votre abonnement sera activé sous peu.');
    if (statut === 'annule') setErreur('Paiement annulé.');
  }, [searchParams]);

  async function payerMoncash(plan: PlanType) {
    setErreur(null);
    setChargementAction(`moncash-${plan}`);
    try {
      const { data } = await api.post('/billing/moncash/initiate', { plan });
      setMoncash(data.data);
    } catch (err) {
      setErreur(apiErrorMessage(err, 'Impossible d\'initier le paiement'));
    } finally {
      setChargementAction(null);
    }
  }

  async function payerStripe(plan: PlanType) {
    setErreur(null);
    setChargementAction(`stripe-${plan}`);
    try {
      const { data } = await api.post('/billing/stripe/checkout', { plan });
      window.location.href = data.data.url;
    } catch (err) {
      setErreur(apiErrorMessage(err, 'Paiement par carte indisponible pour le moment'));
    } finally {
      setChargementAction(null);
    }
  }

  async function onSubmitProof(e: FormEvent) {
    e.preventDefault();
    if (!moncash) return;
    setErreur(null);
    try {
      await api.post('/billing/moncash/submit-proof', {
        paymentId: moncash.payment.id,
        referenceTransaction: reference,
      });
      setSucces('Preuve envoyée. Un administrateur validera votre paiement sous peu.');
      setMoncash(null);
      setReference('');
    } catch (err) {
      setErreur(apiErrorMessage(err, "Impossible d'envoyer la preuve"));
    }
  }

  if (chargementAuth || utilisateur?.role !== 'CLIENT_ADMIN' || !overview || !plans) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Facturation</h1>
        <p className="text-sm text-neutral-500">Gérez votre plan et votre consommation.</p>
      </div>

      <div className="rounded border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Plan actuel</p>
            <p className="text-lg font-semibold">{overview.limites.label}</p>
          </div>
          {overview.expiresAt && (
            <p className="text-sm text-neutral-500">
              Renouvellement le {new Date(overview.expiresAt).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <UsageBar label="Domaines" used={overview.usage.domaines} max={overview.limites.maxDomaines} />
          <UsageBar
            label="Boîtes mail"
            used={overview.usage.mailboxes}
            max={overview.limites.maxMailboxesTotal}
          />
        </div>
      </div>

      {erreur && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
      {succes && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">{succes}</p>}

      {moncash && (
        <div className="rounded border border-neutral-300 bg-neutral-50 p-4">
          <p className="font-medium">Payer par MonCash</p>
          <p className="mt-2 text-sm text-neutral-700">
            Envoyez <strong>{moncash.instructions.montantHtg} HTG</strong> au numéro MonCash{' '}
            <strong>{moncash.instructions.numero}</strong> ({moncash.instructions.nom}), puis entrez le
            numéro de référence de la transaction ci-dessous.
          </p>
          <form onSubmit={onSubmitProof} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Référence de transaction"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
              required
            />
            <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-sm text-white">
              Envoyer la preuve
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS_ACHETABLES.map((plan) => {
          const limites = plans[plan];
          const estPlanActuel = overview.plan === plan;
          return (
            <div key={plan} className="flex flex-col gap-3 rounded border border-neutral-200 p-4">
              <div>
                <p className="font-semibold">{limites.label}</p>
                <p className="text-2xl font-semibold">
                  {limites.prixHtg} <span className="text-sm font-normal text-neutral-500">HTG/mois</span>
                </p>
              </div>
              <ul className="flex flex-1 flex-col gap-1 text-sm text-neutral-600">
                <li>
                  {Number.isFinite(limites.maxDomaines) ? limites.maxDomaines : 'Illimité'} domaine
                  {limites.maxDomaines > 1 ? 's' : ''}
                </li>
                <li>
                  {Number.isFinite(limites.maxMailboxesTotal) ? limites.maxMailboxesTotal : 'Illimité'} boîtes
                  mail
                </li>
                <li>{limites.quotaMbParBoite} Mo par boîte</li>
              </ul>
              {estPlanActuel ? (
                <span className="rounded bg-neutral-100 px-3 py-2 text-center text-sm text-neutral-500">
                  Plan actuel
                </span>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => payerMoncash(plan)}
                    disabled={chargementAction === `moncash-${plan}`}
                    className="rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    Payer par MonCash
                  </button>
                  <button
                    onClick={() => payerStripe(plan)}
                    disabled={chargementAction === `stripe-${plan}`}
                    className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Payer par carte
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingPageContent />
    </Suspense>
  );
}
