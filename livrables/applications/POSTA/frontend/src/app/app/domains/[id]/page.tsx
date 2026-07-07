'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, apiErrorMessage } from '@/lib/api';
import { Domain } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { DnsRecordsPanel } from '@/components/DnsRecordsPanel';
import { MailboxesPanel } from '@/components/MailboxesPanel';
import { AliasesPanel } from '@/components/AliasesPanel';

export default function DomainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [verification, setVerification] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function charger() {
    const { data } = await api.get(`/domains/${id}`);
    setDomain(data.data.domain);
  }

  useEffect(() => {
    charger();
  }, [id]);

  async function onVerify() {
    setVerification(true);
    setErreur(null);
    try {
      const { data } = await api.post(`/domains/${id}/verify`);
      setDomain(data.data.domain);
    } catch (err) {
      setErreur(apiErrorMessage(err, 'Vérification impossible'));
    } finally {
      setVerification(false);
    }
  }

  async function onDeleteDomain() {
    if (!domain) return;
    if (!confirm(`Supprimer définitivement le domaine ${domain.nomDomaine} ?`)) return;
    setErreur(null);
    try {
      await api.delete(`/domains/${id}`);
      router.push('/app');
    } catch (err) {
      setErreur(apiErrorMessage(err, 'Suppression impossible'));
    }
  }

  if (!domain) return <p className="text-sm text-neutral-400">Chargement...</p>;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <div>
        <Link href="/app" className="text-sm text-neutral-500 underline underline-offset-2">
          ← Domaines
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{domain.nomDomaine}</h1>
            <StatusBadge statut={domain.statut} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onVerify}
              disabled={verification}
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {verification ? 'Vérification...' : 'Vérifier les DNS'}
            </button>
            <button
              onClick={onDeleteDomain}
              className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Supprimer le domaine
            </button>
          </div>
        </div>
        {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Configuration DNS
        </h2>
        <DnsRecordsPanel domain={domain} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Boîtes mail
        </h2>
        <MailboxesPanel domainId={domain.id} nomDomaine={domain.nomDomaine} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Alias</h2>
        <AliasesPanel domainId={domain.id} nomDomaine={domain.nomDomaine} />
      </section>
    </div>
  );
}
