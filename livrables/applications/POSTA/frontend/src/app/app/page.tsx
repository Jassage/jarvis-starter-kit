'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { api, apiErrorMessage } from '@/lib/api';
import { Domain, SubscriptionOverview } from '@/lib/types';
import { StatusBadge, CheckDot } from '@/components/StatusBadge';
import { useAuthStore } from '@/store/authStore';

export default function DomainesPage() {
  const { utilisateur } = useAuthStore();
  const [domains, setDomains] = useState<Domain[] | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionOverview | null>(null);
  const [nomDomaine, setNomDomaine] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);

  async function charger() {
    const { data } = await api.get('/domains');
    setDomains(data.data.domains);
  }

  useEffect(() => {
    charger();
  }, []);

  useEffect(() => {
    if (utilisateur?.role === 'CLIENT_ADMIN') {
      api.get('/billing/subscription').then(({ data }) => setSubscription(data.data));
    }
  }, [utilisateur]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setCreation(true);
    try {
      await api.post('/domains', { nomDomaine });
      setNomDomaine('');
      await charger();
      if (utilisateur?.role === 'CLIENT_ADMIN') {
        api.get('/billing/subscription').then(({ data }) => setSubscription(data.data));
      }
    } catch (err) {
      setErreur(apiErrorMessage(err, "Impossible de créer le domaine"));
    } finally {
      setCreation(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Domaines</h1>
        <p className="text-sm text-neutral-500">
          Ajoutez un nom de domaine pour commencer à créer des adresses email personnalisées.
        </p>
        {subscription && (
          <p className="mt-2 text-sm text-neutral-500">
            Plan {subscription.limites.label} : {subscription.usage.domaines}/
            {Number.isFinite(subscription.limites.maxDomaines) ? subscription.limites.maxDomaines : '∞'}{' '}
            domaines, {subscription.usage.mailboxes}/
            {Number.isFinite(subscription.limites.maxMailboxesTotal)
              ? subscription.limites.maxMailboxesTotal
              : '∞'}{' '}
            boîtes mail utilisées ·{' '}
            <Link href="/app/billing" className="underline underline-offset-2">
              gérer mon abonnement
            </Link>
          </p>
        )}
      </div>

      <form onSubmit={onCreate} className="flex items-start gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="mondomaine.ht"
            value={nomDomaine}
            onChange={(e) => setNomDomaine(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            required
          />
          {erreur && <p className="mt-1 text-sm text-red-600">{erreur}</p>}
        </div>
        <button
          type="submit"
          disabled={creation}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {creation ? 'Ajout...' : 'Ajouter un domaine'}
        </button>
      </form>

      <div className="overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Domaine</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">MX</th>
              <th className="px-4 py-3">SPF</th>
              <th className="px-4 py-3">DKIM</th>
              <th className="px-4 py-3">DMARC</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {domains?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-neutral-400">
                  Aucun domaine pour l&apos;instant.
                </td>
              </tr>
            )}
            {domains?.map((d) => (
              <tr key={d.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{d.nomDomaine}</td>
                <td className="px-4 py-3">
                  <StatusBadge statut={d.statut} />
                </td>
                <td className="px-4 py-3">
                  <CheckDot ok={d.mxOk} />
                </td>
                <td className="px-4 py-3">
                  <CheckDot ok={d.spfOk} />
                </td>
                <td className="px-4 py-3">
                  <CheckDot ok={d.dkimOk} />
                </td>
                <td className="px-4 py-3">
                  <CheckDot ok={d.dmarcOk} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/app/domains/${d.id}`} className="text-neutral-900 underline underline-offset-2">
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
