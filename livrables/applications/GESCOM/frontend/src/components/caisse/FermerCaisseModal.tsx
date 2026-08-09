'use client';
import { useState } from 'react';
import { useCaisseStore, SessionCaisse } from '@/stores/caisseStore';
import { formatMontant } from '@/lib/utils';

export default function FermerCaisseModal({ session, onDone }: { session: SessionCaisse; onDone: () => void }) {
  const { fermer } = useCaisseStore();
  const [soldeFermeture, setSoldeFermeture] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const soldeAttendu = session.soldeAttenduActuel ?? Number(session.soldeOuverture);
  const compte = Number(soldeFermeture || 0);
  const ecart = soldeFermeture !== '' ? Math.round((compte - soldeAttendu) * 100) / 100 : null;

  const handleSubmit = async () => {
    setError('');
    if (soldeFermeture === '' || compte < 0) { setError('Saisissez le montant compté dans le tiroir'); return; }
    setSubmitting(true);
    try {
      await fermer(session.id, compte, notes || undefined);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la fermeture');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--color-line-2)' }}>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--color-ink-2)' }}>Fond d&apos;ouverture</span>
          <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{formatMontant(session.soldeOuverture)} HTG</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--color-ink-2)' }}>Ventes espèces enregistrées</span>
          <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{formatMontant(soldeAttendu - Number(session.soldeOuverture))} HTG</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-ink-2)' }}>Solde attendu dans le tiroir</span>
          <span className="font-extrabold" style={{ color: 'var(--color-ink)' }}>{formatMontant(soldeAttendu)} HTG</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Montant compté physiquement (HTG)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          className="input"
          placeholder="0"
          value={soldeFermeture}
          onChange={(e) => setSoldeFermeture(e.target.value)}
          autoFocus
        />
      </div>

      {ecart !== null && (
        <div
          className="flex items-center justify-between p-3 rounded-xl text-sm"
          style={{
            background: ecart === 0 ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
            color: ecart === 0 ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        >
          <span className="font-semibold">Écart constaté</span>
          <span className="font-extrabold">{ecart > 0 ? '+' : ''}{formatMontant(ecart)} HTG</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Notes (optionnel)</label>
        <textarea
          className="input"
          rows={2}
          placeholder="Justification de l'écart, remarques..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && (
        <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3.5 rounded-2xl font-bold text-base text-white disabled:opacity-40 transition-all"
        style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
      >
        {submitting ? 'Fermeture...' : 'Fermer la caisse'}
      </button>
    </div>
  );
}
