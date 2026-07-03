'use client';
import { useEffect, useState } from 'react';
import { ArrowRightLeft, Clock, PackageCheck, XCircle } from 'lucide-react';
import { useTransfertStore, Transfert } from '@/stores/transfertStore';
import { formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import NouveauTransfertModal from '@/components/transferts/NouveauTransfertModal';

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  EN_TRANSIT: { bg: '#eff6ff', fg: '#2563eb', label: 'En transit' },
  RECU: { bg: 'var(--color-success-soft)', fg: 'var(--color-success)', label: 'Reçu' },
  ANNULE: { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)', label: 'Annulé' },
};

export default function TransfertsPage() {
  const { transferts, isLoading, fetchTransferts, recevoirTransfert, annulerTransfert } = useTransfertStore();
  const [modalCreer, setModalCreer] = useState(false);

  useEffect(() => { fetchTransferts(); }, [fetchTransferts]);

  const enTransit = transferts.filter((t) => t.statut === 'EN_TRANSIT').length;
  const recus = transferts.filter((t) => t.statut === 'RECU').length;

  const handleRecevoir = async (t: Transfert) => {
    if (!confirm(`Confirmer la réception du transfert ${t.numero} à ${t.emplacementDest.nom} ?`)) return;
    try { await recevoirTransfert(t.id); } catch (err: any) { alert(err.response?.data?.error || 'Erreur'); }
  };

  const handleAnnuler = async (t: Transfert) => {
    if (!confirm(`Annuler le transfert ${t.numero} ? Le stock sera restitué à ${t.emplacementSource.nom}.`)) return;
    try { await annulerTransfert(t.id); } catch (err: any) { alert(err.response?.data?.error || 'Erreur'); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 card-accent-blue">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>EN TRANSIT</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{enTransit}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-accent-green">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>REÇUS</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{recus}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-accent-violet">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>TOTAL</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{transferts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-ink-2)' }}>Tous les transferts</h2>
        <button onClick={() => setModalCreer(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
          + Nouveau transfert
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-line-2)' }}>
                {['N°', 'Date envoi', 'Source', 'Destination', 'Lignes', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transferts.map((t) => {
                const s = STATUT_STYLE[t.statut];
                return (
                  <tr key={t.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>{t.numero}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{formatRelativeTime(t.dateEnvoi)}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{t.emplacementSource.nom}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{t.emplacementDest.nom}</td>
                    <td className="px-4 py-3 text-center" style={{ color: 'var(--color-ink-2)' }}>{t.lignes.length}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap space-x-3">
                      {t.statut === 'EN_TRANSIT' && (
                        <>
                          <button onClick={() => handleRecevoir(t)} className="text-xs font-semibold inline-flex items-center gap-1"
                            style={{ color: 'var(--color-primary-2)' }}>
                            <PackageCheck className="w-3.5 h-3.5" /> Réceptionner
                          </button>
                          <button onClick={() => handleAnnuler(t)} className="text-xs font-semibold inline-flex items-center gap-1"
                            style={{ color: 'var(--color-danger)' }}>
                            <XCircle className="w-3.5 h-3.5" /> Annuler
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && transferts.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-ink-3)' }}>
            Aucun transfert. Créez votre premier transfert inter-sites ci-dessus.
          </div>
        )}
      </div>

      <Modal open={modalCreer} onClose={() => setModalCreer(false)} title="Nouveau transfert inter-sites" maxWidth={700}>
        <NouveauTransfertModal onDone={() => setModalCreer(false)} />
      </Modal>
    </div>
  );
}
