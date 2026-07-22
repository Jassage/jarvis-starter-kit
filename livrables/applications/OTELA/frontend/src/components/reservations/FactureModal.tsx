'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { useFacturesStore, MethodePaiement } from '@/stores/facturesStore';
import { useFolioStore } from '@/stores/folioStore';

const DEPARTEMENT_LABEL: Record<string, string> = {
  RESTAURANT: 'Restaurant',
  BAR: 'Bar',
  ROOM_SERVICE: 'Room service',
  MINIBAR: 'Minibar',
  SPA: 'Spa',
  BLANCHISSERIE: 'Blanchisserie',
  EVENEMENTIEL: 'Événementiel',
  VOITURIER: 'Voiturier',
  AUTRE: 'Autre',
};

const STATUT_TONE: Record<string, 'danger' | 'warning' | 'success'> = {
  IMPAYE: 'danger',
  PARTIEL: 'warning',
  PAYE: 'success',
};

const STATUT_LABEL: Record<string, string> = {
  IMPAYE: 'Impayée',
  PARTIEL: 'Partiellement payée',
  PAYE: 'Payée',
};

const METHODE_LABEL: Record<MethodePaiement, string> = {
  ESPECES: 'Espèces',
  CARTE: 'Carte',
  MONCASH: 'MonCash',
  AUTRE: 'Autre',
};

export default function FactureModal({ open, onClose, reservationId }: { open: boolean; onClose: () => void; reservationId: string | null }) {
  const { facture, isLoading, error, fetchFacture, enregistrerPaiement, reset } = useFacturesStore();
  const { folio, fetchFolio, reset: resetFolio } = useFolioStore();
  const [montant, setMontant] = useState('');
  const [methode, setMethode] = useState<MethodePaiement>('ESPECES');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [telechargement, setTelechargement] = useState(false);

  useEffect(() => {
    if (open && reservationId) {
      fetchFacture(reservationId);
      fetchFolio(reservationId);
    }
    if (!open) {
      reset();
      resetFolio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reservationId]);

  if (!open) return null;

  const totalPaye = facture ? facture.paiements.reduce((s, p) => s + Number(p.montant), 0) : 0;
  const solde = facture ? Number(facture.montantTotal) - totalPaye : 0;

  // Le PDF back-office est authentifié : on le récupère en blob via l'API (qui porte
  // le token) plutôt que par un simple lien, puis on déclenche le téléchargement.
  const telechargerPdf = async () => {
    if (!reservationId) return;
    setTelechargement(true);
    try {
      const { data } = await api.get(`/factures/${reservationId}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${reservationId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setFormError('Impossible de générer le PDF');
    } finally {
      setTelechargement(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facture) return;
    setFormError('');
    setSubmitting(true);
    try {
      await enregistrerPaiement(facture.id, { montant: Number(montant), methode });
      setMontant('');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Impossible d\'enregistrer le paiement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Facture" maxWidth={480}>
      {isLoading || !facture ? (
        <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>{error || 'Chargement...'}</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Badge tone={STATUT_TONE[facture.statutPaiement]}>{STATUT_LABEL[facture.statutPaiement]}</Badge>
            <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{facture.devise}</span>
          </div>

          {folio && folio.lignes.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>DÉTAIL DU FOLIO</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-ink-2)' }}>Nuitée(s) — chambre</span>
                  <span style={{ color: 'var(--color-ink)' }}>{(Number(facture!.montantHT) + Number(facture!.taxes)).toLocaleString('fr-FR')}</span>
                </div>
                {folio.lignes.map((l) => (
                  <div key={l.id} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-ink-2)' }}>
                      {DEPARTEMENT_LABEL[l.departementSource] || l.departementSource} — {l.description}
                      <span className="block text-xs" style={{ color: 'var(--color-ink-3)' }}>
                        {new Date(l.dateHeure).toLocaleString('fr-FR')}{l.employe ? ` · ${l.employe.nom}` : ''}
                      </span>
                    </span>
                    <span style={{ color: 'var(--color-ink)' }}>{Number(l.montant).toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5 p-4 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-2)' }}>Montant HT</span><span style={{ color: 'var(--color-ink)' }}>{Number(facture.montantHT).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-2)' }}>Taxes</span><span style={{ color: 'var(--color-ink)' }}>{Number(facture.taxes).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}><span>Total</span><span>{Number(facture.montantTotal).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-2)' }}>Payé</span><span style={{ color: 'var(--color-success)' }}>{totalPaye.toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between text-sm font-semibold"><span style={{ color: 'var(--color-ink-2)' }}>Solde restant</span><span style={{ color: solde > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{solde.toLocaleString('fr-FR')}</span></div>
          </div>

          {facture.paiements.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>HISTORIQUE DES PAIEMENTS</p>
              <div className="space-y-1.5">
                {facture.paiements.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-ink-2)' }}>{METHODE_LABEL[p.methode]} · {new Date(p.datePaiement).toLocaleDateString('fr-FR')}{p.employe ? ` · ${p.employe.nom}` : ''}</span>
                    <span style={{ color: 'var(--color-ink)' }}>{Number(p.montant).toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="button" onClick={telechargerPdf} disabled={telechargement} className="btn btn-secondary w-full">
            <Download className="w-4 h-4" /> {telechargement ? 'Génération...' : 'Télécharger la facture PDF'}
          </button>

          {solde > 0 && (
            <form onSubmit={handleSubmit} className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--color-line)' }}>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>ENREGISTRER UN PAIEMENT</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min={0} max={solde} step="0.01" required placeholder="Montant" className="input" value={montant} onChange={(e) => setMontant(e.target.value)} />
                <select className="input" value={methode} onChange={(e) => setMethode(e.target.value as MethodePaiement)}>
                  {Object.entries(METHODE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {formError && <div className="p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{formError}</div>}
              <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Enregistrement...' : 'Enregistrer le paiement'}</button>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
