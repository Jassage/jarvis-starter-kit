'use client';
import { useEffect, useState } from 'react';
import { ShoppingCart, TrendingUp, Clock, XCircle } from 'lucide-react';
import { useVenteStore, Vente } from '@/stores/venteStore';
import { formatMontant, formatMontantCompact, formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import NouvelleVenteModal from '@/components/ventes/NouvelleVenteModal';

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  VALIDEE: { bg: 'var(--color-success-soft)', fg: 'var(--color-success)', label: 'Validée' },
  BROUILLON: { bg: 'var(--color-warning-soft)', fg: 'var(--color-warning)', label: 'Brouillon' },
  ANNULEE: { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)', label: 'Annulée' },
};

const MODE_LABELS: Record<string, string> = {
  ESPECES: 'Espèces', CHEQUE: 'Chèque', VIREMENT: 'Virement', CREDIT: 'Crédit',
};

export default function VentesPage() {
  const { ventes, isLoading, fetchVentes, cancelVente } = useVenteStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { fetchVentes(); }, [fetchVentes]);

  const ventesValidees = ventes.filter((v) => v.statut === 'VALIDEE');
  const totalJour = ventesValidees.reduce((sum, v) => sum + Number(v.montantTotal), 0);

  const handleCancel = async (v: Vente) => {
    if (!confirm(`Annuler la vente ${v.numero} ? Le stock sera restitué.`)) return;
    try {
      await cancelVente(v.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats du jour */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 card-accent-green">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>TOTAL VENTES</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(totalJour)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-accent-blue">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>VENTES VALIDÉES</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{ventesValidees.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-accent-amber">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>EN COURS (CRÉDIT)</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>
                {ventes.filter((v) => v.statut === 'VALIDEE' && v.modePaiement === 'CREDIT').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-ink-2)' }}>Historique des ventes</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}
        >
          + Nouvelle vente
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-line-2)' }}>
                {['N°', 'Date', 'Client', 'Emplacement', 'Mode', 'Total', 'Payé', 'Statut', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventes.map((v) => {
                const s = STATUT_STYLE[v.statut];
                return (
                  <tr key={v.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>{v.numero}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{formatRelativeTime(v.dateVente)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{v.client?.nom || <span style={{ color: 'var(--color-ink-3)' }}>Comptant</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{v.emplacement.nom}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--color-ink-2)' }}>{MODE_LABELS[v.modePaiement]}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{formatMontant(v.montantTotal)} HTG</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: Number(v.montantPaye) >= Number(v.montantTotal) ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {formatMontant(v.montantPaye)} HTG
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {v.statut === 'VALIDEE' && (
                        <button onClick={() => handleCancel(v)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>
                          <XCircle className="w-3.5 h-3.5" /> Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && ventes.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-ink-3)' }}>
            Aucune vente. Créez votre première vente avec le bouton ci-dessus.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle vente" maxWidth={700}>
        <NouvelleVenteModal onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
