'use client';
import { useState } from 'react';
import { useComptaStore } from '@/stores/comptaStore';

export default function NouvelleEcritureModal({ onDone }: { onDone: () => void }) {
  const { comptes, createEcriture } = useComptaStore();
  const [compteDebitId, setCompteDebitId] = useState('');
  const [compteCreditId, setCompteCreditId] = useState('');
  const [montant, setMontant] = useState('');
  const [libelle, setLibelle] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    if (!compteDebitId || !compteCreditId) { setError('Sélectionnez les deux comptes'); return; }
    if (compteDebitId === compteCreditId) { setError('Débit et crédit doivent être différents'); return; }
    if (!montant || Number(montant) <= 0) { setError('Montant invalide'); return; }
    if (!libelle.trim()) { setError('Libellé requis'); return; }
    setSubmitting(true);
    try {
      await createEcriture({ compteDebitId, compteCreditId, montant: Number(montant), libelle: libelle.trim(), date: date || undefined });
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Compte à débiter</label>
          <select className="input" value={compteDebitId} onChange={(e) => setCompteDebitId(e.target.value)}>
            <option value="">Choisir...</option>
            {comptes.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.intitule}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Compte à créditer</label>
          <select className="input" value={compteCreditId} onChange={(e) => setCompteCreditId(e.target.value)}>
            <option value="">Choisir...</option>
            {comptes.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.intitule}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Montant (HTG)</label>
          <input type="number" min={0} step="0.01" className="input" value={montant} onChange={(e) => setMontant(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Libellé</label>
          <input className="input" placeholder="Ex : Régularisation stock..." value={libelle} onChange={(e) => setLibelle(e.target.value)} />
        </div>
      </div>

      {error && <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
        {submitting ? 'Enregistrement...' : "Enregistrer l'écriture"}
      </button>
    </form>
  );
}
