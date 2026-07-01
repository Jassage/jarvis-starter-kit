'use client';
import { useState } from 'react';
import { Commande, useAchatStore } from '@/stores/achatStore';
import { formatMontant } from '@/lib/utils';

export default function ReceptionModal({ commande, onDone }: { commande: Commande; onDone: () => void }) {
  const { recevoirCommande } = useAchatStore();
  const [receptions, setReceptions] = useState<Record<string, string>>(
    Object.fromEntries(commande.lignes.map((l) => [l.id, String(l.quantiteCommandee - l.quantiteRecue)]))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const lignes = commande.lignes
        .map((l) => ({ ligneId: l.id, quantiteRecue: Number(receptions[l.id] ?? 0) }))
        .filter((l) => l.quantiteRecue > 0);
      if (lignes.length === 0) { setError('Entrez au moins une quantité reçue'); setSubmitting(false); return; }
      await recevoirCommande(commande.id, lignes);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réception');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-line-2)' }}>
        <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{commande.numero}</span>
        <span className="mx-2" style={{ color: 'var(--color-ink-3)' }}>·</span>
        <span style={{ color: 'var(--color-ink-2)' }}>{commande.fournisseur.nom}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-line-2)' }}>
              {['Produit', 'Commandé', 'Déjà reçu', 'À recevoir maintenant', 'Prix/unité'].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commande.lignes.map((l) => {
              const restant = l.quantiteCommandee - l.quantiteRecue;
              return (
                <tr key={l.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{l.produit.nom}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: 'var(--color-ink-2)' }}>{l.quantiteCommandee} {l.produit.unite}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: l.quantiteRecue > 0 ? 'var(--color-success)' : 'var(--color-ink-3)' }}>{l.quantiteRecue}</td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min={0}
                      max={restant}
                      value={receptions[l.id] ?? ''}
                      onChange={(e) => setReceptions((prev) => ({ ...prev, [l.id]: e.target.value }))}
                      disabled={restant <= 0}
                      className="w-20 text-center rounded-lg px-2 py-1 text-sm"
                      style={{ background: restant > 0 ? 'var(--color-surface)' : 'var(--color-line-2)', border: '1px solid var(--color-line)' }}
                    />
                    {restant > 0 && <span className="text-xs ml-1.5" style={{ color: 'var(--color-ink-3)' }}>/ {restant}</span>}
                    {restant <= 0 && <span className="text-xs ml-1.5 font-semibold" style={{ color: 'var(--color-success)' }}>Complet</span>}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{formatMontant(l.prixUnitaireAchat)} HTG</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
        {submitting ? 'Enregistrement...' : 'Valider la réception'}
      </button>
    </form>
  );
}
