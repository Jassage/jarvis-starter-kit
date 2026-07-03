'use client';
import { useEffect, useState } from 'react';
import { ArrowRightLeft, Clock, PackageCheck, XCircle } from 'lucide-react';
import { useTransfertStore, Transfert } from '@/stores/transfertStore';
import { formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Badge, { BadgeTone } from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import NouveauTransfertModal from '@/components/transferts/NouveauTransfertModal';

const STATUT_STYLE: Record<string, { tone: BadgeTone; label: string }> = {
  EN_TRANSIT: { tone: 'info', label: 'En transit' },
  RECU: { tone: 'success', label: 'Reçu' },
  ANNULE: { tone: 'danger', label: 'Annulé' },
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
        <StatCard compact icon={Clock} theme="blue" label="EN TRANSIT" value={String(enTransit)} />
        <StatCard compact icon={PackageCheck} theme="brand" label="REÇUS" value={String(recus)} />
        <StatCard compact icon={ArrowRightLeft} theme="violet" label="TOTAL" value={String(transferts.length)} />
      </div>

      <PageToolbar actionLabel="Nouveau transfert" onAction={() => setModalCreer(true)} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {['N°', 'Date envoi', 'Source', 'Destination', 'Lignes', 'Statut', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transferts.map((t) => {
                const s = STATUT_STYLE[t.statut];
                return (
                  <tr key={t.id}>
                    <td className="font-mono text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>{t.numero}</td>
                    <td className="whitespace-nowrap">{formatRelativeTime(t.dateEnvoi)}</td>
                    <td className="font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{t.emplacementSource.nom}</td>
                    <td className="font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{t.emplacementDest.nom}</td>
                    <td className="text-center">{t.lignes.length}</td>
                    <td><Badge tone={s.tone}>{s.label}</Badge></td>
                    <td className="whitespace-nowrap space-x-3">
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
          <EmptyState icon={ArrowRightLeft} title="Aucun transfert" hint="Créez votre premier transfert inter-sites ci-dessus." />
        )}
      </div>

      <Modal open={modalCreer} onClose={() => setModalCreer(false)} title="Nouveau transfert inter-sites" maxWidth={700}>
        <NouveauTransfertModal onDone={() => setModalCreer(false)} />
      </Modal>
    </div>
  );
}
