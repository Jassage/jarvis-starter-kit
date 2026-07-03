'use client';
import { useEffect } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useComptaStore } from '@/stores/comptaStore';
import { formatMontant, formatRelativeTime } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function ReconciliationTab() {
  const { echecs, fetchEchecs, resoudreEchec } = useComptaStore();

  useEffect(() => { fetchEchecs(); }, [fetchEchecs]);

  const handleResoudre = async (id: string) => {
    if (!confirm('Marquer cette écriture en échec comme résolue ?')) return;
    try { await resoudreEchec(id); } catch (err: any) { alert(err.response?.data?.error || 'Erreur'); }
  };

  const nonResolus = echecs.filter((e) => !e.resolu);
  const resolus = echecs.filter((e) => e.resolu);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--color-ink-2)' }}>À réconcilier ({nonResolus.length})</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  {['Date', 'Débit', 'Crédit', 'Libellé', 'Montant', 'Erreur', 'Origine', ''].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nonResolus.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{formatRelativeTime(e.createdAt)}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-ink)' }}>{e.compteDebitNumero}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-ink)' }}>{e.compteCreditNumero}</td>
                    <td>{e.libelle}</td>
                    <td className="whitespace-nowrap font-semibold" style={{ color: 'var(--color-ink)' }}>{formatMontant(e.montant)} HTG</td>
                    <td style={{ color: 'var(--color-danger)' }}>{e.erreur}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--color-line-2)', color: 'var(--color-ink-3)' }}>{e.referenceType || '—'}</span>
                    </td>
                    <td className="whitespace-nowrap">
                      <button onClick={() => handleResoudre(e.id)} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Résoudre
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {nonResolus.length === 0 && (
            <EmptyState icon={ShieldCheck} title="Aucune écriture en échec" hint="Tout est réconcilié." />
          )}
        </div>
      </div>

      {resolus.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--color-ink-2)' }}>Résolues ({resolus.length})</h2>
          <div className="card overflow-hidden opacity-70">
            <div className="overflow-x-auto">
              <table className="w-full table-shell">
                <tbody>
                  {resolus.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap" style={{ color: 'var(--color-ink-3)' }}>{formatRelativeTime(e.createdAt)}</td>
                      <td>{e.libelle}</td>
                      <td className="whitespace-nowrap">{formatMontant(e.montant)} HTG</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
