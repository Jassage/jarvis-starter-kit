'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, TrendingUp, Clock, XCircle, Receipt, Wallet, FileText, RotateCcw } from 'lucide-react';
import { useVenteStore, Vente } from '@/stores/venteStore';
import { useCaisseStore } from '@/stores/caisseStore';
import { useAuthStore } from '@/stores/authStore';
import { formatMontant, formatMontantCompact, formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Banner from '@/components/ui/Banner';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import NouvelleVenteModal from '@/components/ventes/NouvelleVenteModal';
import NouveauRetourModal from '@/components/ventes/NouveauRetourModal';

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
  const { sessionActive, fetchActive } = useCaisseStore();
  const { utilisateur } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [retourVente, setRetourVente] = useState<Vente | null>(null);
  const [toCancel, setToCancel] = useState<Vente | null>(null);
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchVentes(); }, [fetchVentes]);

  // Avertissement caisse : seulement affichable de façon fiable pour un utilisateur
  // rattaché à un emplacement fixe (VENDEUR/MAGASINIER). Un GERANT multi-sites doit
  // vérifier sur l'écran /caisse, la vente réelle se bloquera de toute façon côté API.
  useEffect(() => {
    if (utilisateur?.emplacementId) fetchActive(utilisateur.emplacementId);
  }, [utilisateur, fetchActive]);

  const caisseFermee = !!utilisateur?.emplacementId && sessionActive === null;

  const ventesValidees = ventes.filter((v) => v.statut === 'VALIDEE');
  const totalJour = ventesValidees.reduce((sum, v) => sum + Number(v.montantTotal), 0);

  const handleFacture = (v: Vente) => {
    // Cookie httpOnly déjà envoyé par le navigateur sur une navigation directe, pas besoin de axios ici
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/ventes/${v.id}/facture`, '_blank');
  };

  const handleCancel = async () => {
    if (!toCancel) return;
    try {
      await cancelVente(toCancel.id);
      setBanner({ message: `Vente ${toCancel.numero} annulée.`, type: 'success' });
      setToCancel(null);
    } catch (err: any) {
      setBanner({ message: err.response?.data?.error || 'Erreur', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {banner && <Banner message={banner.message} type={banner.type} onClose={() => setBanner(null)} />}

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

      {caisseFermee && (
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
          <Wallet className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold flex-1">Aucune session de caisse ouverte sur votre emplacement. Ouvrez la caisse avant d&apos;enregistrer une vente.</p>
          <Link href="/caisse" className="text-sm font-bold underline shrink-0">Ouvrir la caisse</Link>
        </div>
      )}

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
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={s.tone}>{s.label}</Badge>
                        {!!v._count?.retours && <Badge tone="warning">Retour</Badge>}
                      </div>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button onClick={() => handleFacture(v)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>
                          <FileText className="w-3.5 h-3.5" /> Facture
                        </button>
                        {v.statut === 'VALIDEE' && (
                          <>
                            <button onClick={() => setRetourVente(v)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-warning)' }}>
                              <RotateCcw className="w-3.5 h-3.5" /> Retour
                            </button>
                            <button onClick={() => setToCancel(v)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>
                              <XCircle className="w-3.5 h-3.5" /> Annuler
                            </button>
                          </>
                        )}
                      </div>
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

      {retourVente && (
        <Modal open={!!retourVente} onClose={() => setRetourVente(null)} title={`Retour · ${retourVente.numero}`} maxWidth={520}>
          <NouveauRetourModal vente={retourVente} onDone={() => setRetourVente(null)} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title="Annuler la vente"
        message={toCancel ? `Annuler la vente ${toCancel.numero} ? Le stock sera restitué.` : ''}
        confirmLabel="Annuler la vente"
        danger
        onConfirm={handleCancel}
        onClose={() => setToCancel(null)}
      />
    </div>
  );
}
