'use client';
import { useEffect, useState } from 'react';
import { Wallet, Lock, Unlock, Receipt, ShoppingBag } from 'lucide-react';
import { useCaisseStore } from '@/stores/caisseStore';
import { useEmplacementStore } from '@/stores/emplacementStore';
import { useAuthStore } from '@/stores/authStore';
import { formatMontant, formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import FermerCaisseModal from '@/components/caisse/FermerCaisseModal';

export default function CaissePage() {
  const { sessionActive, historique, isLoading, fetchActive, fetchHistorique, ouvrir } = useCaisseStore();
  const { emplacements, fetchEmplacements } = useEmplacementStore();
  const { utilisateur } = useAuthStore();

  const [emplacementId, setEmplacementId] = useState('');
  const [soldeOuverture, setSoldeOuverture] = useState('');
  const [notesOuverture, setNotesOuverture] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fermerOpen, setFermerOpen] = useState(false);

  useEffect(() => { fetchEmplacements(); }, [fetchEmplacements]);

  useEffect(() => {
    if (utilisateur?.emplacementId) setEmplacementId(utilisateur.emplacementId);
    else if (emplacements.length > 0) setEmplacementId((prev) => prev || emplacements[0].id);
  }, [utilisateur, emplacements]);

  useEffect(() => {
    if (emplacementId) {
      fetchActive(emplacementId);
      fetchHistorique(emplacementId);
    }
  }, [emplacementId, fetchActive, fetchHistorique]);

  const handleOuvrir = async () => {
    setError('');
    if (soldeOuverture === '' || Number(soldeOuverture) < 0) { setError('Saisissez le fond de caisse initial'); return; }
    if (!emplacementId) { setError('Sélectionnez un emplacement'); return; }
    setSubmitting(true);
    try {
      await ouvrir({ emplacementId, soldeOuverture: Number(soldeOuverture), notes: notesOuverture || undefined });
      setSoldeOuverture('');
      setNotesOuverture('');
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'ouverture");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Emplacement</label>
        <select className="input max-w-xs" value={emplacementId} onChange={(e) => setEmplacementId(e.target.value)}>
          {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
      </div>

      {!isLoading && sessionActive === null && emplacementId && (
        <div className="card p-5 sm:p-6 space-y-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: 'var(--gradient-amber)' }}>
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold" style={{ color: 'var(--color-ink)' }}>Caisse fermée</p>
              <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucune vente ne peut être enregistrée tant que la caisse n&apos;est pas ouverte.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Fond de caisse initial (HTG)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input"
              placeholder="0"
              value={soldeOuverture}
              onChange={(e) => setSoldeOuverture(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Notes (optionnel)</label>
            <input className="input" placeholder="" value={notesOuverture} onChange={(e) => setNotesOuverture(e.target.value)} />
          </div>

          {error && (
            <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleOuvrir}
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl font-bold text-base text-white disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}
          >
            {submitting ? 'Ouverture...' : 'Ouvrir la caisse'}
          </button>
        </div>
      )}

      {sessionActive && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard compact icon={Wallet} theme="brand" label="FOND D'OUVERTURE" value={`${formatMontant(sessionActive.soldeOuverture)} HTG`} />
            <StatCard
              compact
              icon={ShoppingBag}
              theme="blue"
              label="VENTES DE LA SESSION"
              value={String(sessionActive._count?.ventes ?? 0)}
            />
            <StatCard
              compact
              icon={Receipt}
              theme="amber"
              label="SOLDE ATTENDU DANS LE TIROIR"
              value={`${formatMontant(sessionActive.soldeAttenduActuel ?? sessionActive.soldeOuverture)} HTG`}
            />
          </div>

          <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: 'var(--gradient-brand)' }}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold" style={{ color: 'var(--color-ink)' }}>Caisse ouverte · {sessionActive.emplacement.nom}</p>
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
                  Ouverte par {sessionActive.ouvertPar.prenom} {sessionActive.ouvertPar.nom} · {formatRelativeTime(sessionActive.dateOuverture)}
                </p>
              </div>
            </div>
            <button onClick={() => setFermerOpen(true)} className="btn" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
              <Lock className="w-4 h-4" />
              Fermer la caisse
            </button>
          </div>
        </>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Historique des sessions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {['Ouverture', 'Fermeture', 'Ouvert par', 'Fond', 'Attendu', 'Compté', 'Écart', 'Statut'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historique.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap">{formatRelativeTime(s.dateOuverture)}</td>
                  <td className="whitespace-nowrap">{s.dateFermeture ? formatRelativeTime(s.dateFermeture) : '—'}</td>
                  <td className="whitespace-nowrap">{s.ouvertPar.prenom} {s.ouvertPar.nom}</td>
                  <td className="whitespace-nowrap">{formatMontant(s.soldeOuverture)} HTG</td>
                  <td className="whitespace-nowrap">{s.soldeTheorique != null ? `${formatMontant(s.soldeTheorique)} HTG` : '—'}</td>
                  <td className="whitespace-nowrap">{s.soldeFermeture != null ? `${formatMontant(s.soldeFermeture)} HTG` : '—'}</td>
                  <td className="whitespace-nowrap font-semibold" style={{ color: s.ecartConstate == null ? 'var(--color-ink-3)' : Number(s.ecartConstate) === 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {s.ecartConstate != null ? `${Number(s.ecartConstate) > 0 ? '+' : ''}${formatMontant(s.ecartConstate)} HTG` : '—'}
                  </td>
                  <td><Badge tone={s.statut === 'OUVERTE' ? 'success' : 'neutral'}>{s.statut === 'OUVERTE' ? 'Ouverte' : 'Fermée'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && historique.length === 0 && (
          <EmptyState icon={Wallet} title="Aucune session de caisse" hint="L'historique apparaîtra ici après la première ouverture." />
        )}
      </div>

      {sessionActive && (
        <Modal open={fermerOpen} onClose={() => setFermerOpen(false)} title="Fermer la caisse" maxWidth={440}>
          <FermerCaisseModal session={sessionActive} onDone={() => setFermerOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
