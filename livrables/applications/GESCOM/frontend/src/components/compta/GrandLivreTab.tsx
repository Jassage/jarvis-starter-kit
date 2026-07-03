'use client';
import { useEffect, useState } from 'react';
import { Scale, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useComptaStore } from '@/stores/comptaStore';
import { formatMontant } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';

export default function GrandLivreTab() {
  const { comptes, grandLivre, fetchComptes, fetchGrandLivre } = useComptaStore();
  const [compteId, setCompteId] = useState('');

  useEffect(() => { fetchComptes(); }, [fetchComptes]);

  useEffect(() => {
    if (comptes.length > 0 && !compteId) setCompteId(comptes[0].id);
  }, [comptes, compteId]);

  useEffect(() => {
    if (compteId) fetchGrandLivre(compteId);
  }, [compteId, fetchGrandLivre]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>Compte :</span>
        <select className="input sm:max-w-sm" value={compteId} onChange={(e) => setCompteId(e.target.value)}>
          {comptes.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.intitule}</option>)}
        </select>
      </div>

      {grandLivre && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard compact icon={ArrowDownCircle} theme="blue" label="TOTAL DÉBIT" value={`${formatMontant(grandLivre.soldeDebit)} HTG`} />
            <StatCard compact icon={ArrowUpCircle} theme="violet" label="TOTAL CRÉDIT" value={`${formatMontant(grandLivre.soldeCredit)} HTG`} />
            <StatCard compact icon={Scale} theme={grandLivre.solde >= 0 ? 'brand' : 'rose'} label="SOLDE" value={`${formatMontant(grandLivre.solde)} HTG`} />
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-shell">
                <thead>
                  <tr>
                    {['Date', 'Libellé', 'Débit', 'Crédit', 'Solde cumulé'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grandLivre.lignes.map((l, i) => (
                    <tr key={i}>
                      <td className="whitespace-nowrap">{new Date(l.date).toLocaleDateString('fr-FR')}</td>
                      <td>{l.libelle}</td>
                      <td className="whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{l.debit > 0 ? `${formatMontant(l.debit)} HTG` : '—'}</td>
                      <td className="whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{l.credit > 0 ? `${formatMontant(l.credit)} HTG` : '—'}</td>
                      <td className="whitespace-nowrap font-semibold" style={{ color: 'var(--color-ink)' }}>{formatMontant(l.solde)} HTG</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {grandLivre.lignes.length === 0 && (
              <EmptyState icon={Scale} title="Aucun mouvement" hint="Ce compte n'a encore aucune écriture." />
            )}
          </div>
        </>
      )}
    </div>
  );
}
