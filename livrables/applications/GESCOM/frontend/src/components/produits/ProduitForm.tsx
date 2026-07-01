'use client';
import { useState } from 'react';
import { Produit, ProduitInput, useProduitStore } from '@/stores/produitStore';

export default function ProduitForm({ produit, onDone }: { produit?: Produit; onDone: () => void }) {
  const { createProduit, updateProduit } = useProduitStore();
  const [form, setForm] = useState({
    reference: produit?.reference ?? '',
    nom: produit?.nom ?? '',
    categorie: produit?.categorie ?? '',
    unite: produit?.unite ?? 'unité',
    prixAchatMoyen: produit?.prixAchatMoyen ?? '0',
    prixVenteDetail: produit?.prixVenteDetail ?? '',
    prixVenteGros: produit?.prixVenteGros ?? '',
    seuilAlerte: produit ? String(produit.seuilAlerte) : '0',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: ProduitInput = {
        reference: form.reference.trim(),
        nom: form.nom.trim(),
        categorie: form.categorie.trim() || undefined,
        unite: form.unite.trim() || 'unité',
        prixAchatMoyen: Number(form.prixAchatMoyen) || 0,
        prixVenteDetail: Number(form.prixVenteDetail),
        prixVenteGros: form.prixVenteGros ? Number(form.prixVenteGros) : undefined,
        seuilAlerte: Number(form.seuilAlerte) || 0,
      };
      if (produit) {
        await updateProduit(produit.id, payload);
      } else {
        await createProduit(payload);
      }
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Référence</label>
          <input className="input" required value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
          <input className="input" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom du produit</label>
        <input className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Unité</label>
          <input className="input" value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Seuil d&apos;alerte</label>
          <input type="number" min={0} className="input" value={form.seuilAlerte} onChange={(e) => setForm({ ...form, seuilAlerte: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Prix d&apos;achat moyen</label>
          <input type="number" min={0} step="0.01" className="input" value={form.prixAchatMoyen} onChange={(e) => setForm({ ...form, prixAchatMoyen: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Prix vente détail</label>
          <input type="number" min={0} step="0.01" required className="input" value={form.prixVenteDetail} onChange={(e) => setForm({ ...form, prixVenteDetail: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Prix vente gros</label>
          <input type="number" min={0} step="0.01" className="input" value={form.prixVenteGros} onChange={(e) => setForm({ ...form, prixVenteGros: e.target.value })} />
        </div>
      </div>

      {error && (
        <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
        style={{ background: 'var(--color-primary-2)' }}
      >
        {submitting ? 'Enregistrement...' : produit ? 'Mettre à jour' : 'Créer le produit'}
      </button>
    </form>
  );
}
