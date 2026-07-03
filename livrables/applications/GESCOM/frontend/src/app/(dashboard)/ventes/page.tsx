'use client';
import { useEffect, useState } from 'react';
import { ShoppingCart, TrendingUp, Clock, XCircle, Receipt } from 'lucide-react';
import { useVenteStore, Vente } from '@/stores/venteStore';
import { formatMontant, formatMontantCompact, formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import NouvelleVenteModal from '@/components/ventes/NouvelleVenteModal';

const STATUT_TONE: Record<string, { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  VALIDEE: { tone: 'success', label: 'Validée' },
  BROUILLON: { tone: 'warning', label: 'Brouillon' },
  ANNULEE: { tone: 'danger', label: 'Annulée' },
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard compact icon={TrendingUp} theme="brand" label="TOTAL VENTES" value={formatMontantCompact(totalJour)} />
        <StatCard compact icon={ShoppingCart} theme="blue" label="VENTES VALIDÉES" value={String(ventesValidees.length)} />
        <StatCard
          compact
          icon={Clock}
          theme="amber"
          label="EN COURS (CRÉDIT)"
          value={String(ventes.filter((v) => v.statut === 'VALIDEE' && v.modePaiement === 'CREDIT').length)}
        />
      </div>

      <PageToolbar actionLabel="Nouvelle vente" onAction={() => setModalOpen(true)} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {['N°', 'Date', 'Client', 'Emplacement', 'Mode', 'Total', 'Payé', 'Statut', ''].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventes.map((v) => {
                const s = STATUT_TONE[v.statut];
                return (
                  <tr key={v.id}>
                    <td className="font-mono text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>{v.numero}</td>
                    <td className="whitespace-nowrap">{formatRelativeTime(v.dateVente)}</td>
                    <td className="whitespace-nowrap font-medium" style={{ color: 'var(--color-ink)' }}>{v.client?.nom || <span style={{ color: 'var(--color-ink-3)' }}>Comptant</span>}</td>
                    <td className="whitespace-nowrap">{v.emplacement.nom}</td>
                    <td className="whitespace-nowrap text-xs">{MODE_LABELS[v.modePaiement]}</td>
                    <td className="font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{formatMontant(v.montantTotal)} HTG</td>
                    <td className="whitespace-nowrap" style={{ color: Number(v.montantPaye) >= Number(v.montantTotal) ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {formatMontant(v.montantPaye)} HTG
                    </td>
                    <td><Badge tone={s.tone}>{s.label}</Badge></td>
                    <td className="text-right">
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
          <EmptyState icon={Receipt} title="Aucune vente" hint="Créez votre première vente avec le bouton ci-dessus." />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle vente" maxWidth={700}>
        <NouvelleVenteModal onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
