'use client';
import { useEffect, useState, useMemo } from 'react';
import { useVenteStore, Vente } from '@/stores/venteStore';
import { formatMontant } from '@/lib/utils';

export default function NouveauRetourModal({ vente, onDone }: { vente: Vente; onDone: () => void }) {
  const { retours, fetchRetours, createRetour } = useVenteStore();
  const [quantites, setQuantites] = useState<Record<string, string>>({});
  const [motif, setMotif] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetours(vente.id).finally(() => setLoading(false));
  }, [vente.id, fetchRetours]);

  const dejaRetourneParLigne = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of retours) {
      for (const l of r.lignes) {
        map[l.ligneVenteId] = (map[l.ligneVenteId] || 0) + l.quantite;
      }
    }
    return map;
  }, [retours]);

  const setQuantite = (ligneId: string, value: string) => {
    setQuantites((prev) => ({ ...prev, [ligneId]: value }));
  };

  const montantTotal = vente.lignes.reduce((sum, l) => {
    const q = Number(quantites[l.id] || 0);
    return sum + q * Number(l.prixUnitaire);
  }, 0);

  const handleSubmit = async () => {
    setError('');
    const lignes = vente.lignes
      .map((l) => ({ ligneVenteId: l.id, quantite: Number(quantites[l.id] || 0) }))
      .filter((l) => l.quantite > 0);

    if (lignes.length === 0) { setError('Saisissez au moins une quantité à retourner'); return; }

    setSubmitting(true);
    try {
      await createRetour(vente.id, { motif: motif || undefined, lignes });
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement du retour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-center py-6" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {vente.lignes.map((l) => {
          const dejaRetourne = dejaRetourneParLigne[l.id] || 0;
          const maxRetournable = l.quantite - dejaRetourne;
          return (
            <div key={l.id} className="p-3 rounded-xl" style={{ background: 'var(--color-line-2)', opacity: maxRetournable <= 0 ? 0.5 : 1 }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{l.produit.nom}</p>
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{formatMontant(l.prixUnitaire)} HTG / {l.produit.unite}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
                  Vendu : {l.quantite} · Déjà retourné : {dejaRetourne} · Retournable : {maxRetournable}
                </p>
                <input
                  type="number"
                  min={0}
                  max={maxRetournable}
                  disabled={maxRetournable <= 0}
                  className="w-20 text-center text-sm font-semibold rounded-lg px-1 py-1"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}
                  value={quantites[l.id] || ''}
                  onChange={(e) => setQuantite(l.id, e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Motif (optionnel)</label>
        <input className="input" placeholder="Produit défectueux, erreur de saisie..." value={motif} onChange={(e) => setMotif(e.target.value)} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
        <span className="font-semibold" style={{ color: 'var(--color-ink-2)' }}>Montant du retour</span>
        <span className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{formatMontant(montantTotal)} HTG</span>
      </div>

      {error && (
        <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || montantTotal <= 0}
        className="w-full py-3.5 rounded-2xl font-bold text-base text-white disabled:opacity-40 transition-all"
        style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
      >
        {submitting ? 'Enregistrement...' : 'Enregistrer le retour'}
      </button>
    </div>
  );
}
