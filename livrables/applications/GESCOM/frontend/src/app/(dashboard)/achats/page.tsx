'use client';
import { useEffect, useState } from 'react';
import { Truck, Clock, PackageCheck, ShoppingBag } from 'lucide-react';
import { useAchatStore, Commande } from '@/stores/achatStore';
import { formatMontant, formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Badge, { BadgeTone } from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import NouvelleCommandeModal from '@/components/achats/NouvelleCommandeModal';
import ReceptionModal from '@/components/achats/ReceptionModal';

const STATUT_STYLE: Record<string, { tone: BadgeTone; label: string }> = {
  BROUILLON: { tone: 'neutral', label: 'Brouillon' },
  ENVOYEE: { tone: 'info', label: 'Envoyée' },
  RECUE_PARTIELLE: { tone: 'warning', label: 'Partielle' },
  RECUE: { tone: 'success', label: 'Reçue' },
  ANNULEE: { tone: 'danger', label: 'Annulée' },
};

export default function AchatsPage() {
  const { commandes, isLoading, fetchCommandes, envoyerCommande, annulerCommande } = useAchatStore();
  const [modalCreer, setModalCreer] = useState(false);
  const [commandeReception, setCommandeReception] = useState<Commande | null>(null);

  useEffect(() => { fetchCommandes(); }, [fetchCommandes]);

  const enAttente = commandes.filter((c) => ['ENVOYEE', 'RECUE_PARTIELLE'].includes(c.statut)).length;
  const totalMoisCmds = commandes.filter((c) => c.statut !== 'ANNULEE').reduce((sum, c) => {
    return sum + c.lignes.reduce((s, l) => s + l.quantiteCommandee * Number(l.prixUnitaireAchat), 0);
  }, 0);

  const canRecevoir = (c: Commande) => ['ENVOYEE', 'RECUE_PARTIELLE'].includes(c.statut);
  const canEnvoyer = (c: Commande) => c.statut === 'BROUILLON';
  const canAnnuler = (c: Commande) => ['BROUILLON', 'ENVOYEE'].includes(c.statut);

  const handleEnvoyer = async (c: Commande) => {
    if (!confirm(`Marquer la commande ${c.numero} comme envoyée au fournisseur ?`)) return;
    try { await envoyerCommande(c.id); } catch (err: any) { alert(err.response?.data?.error || 'Erreur'); }
  };

  const handleAnnuler = async (c: Commande) => {
    if (!confirm(`Annuler la commande ${c.numero} ?`)) return;
    try { await annulerCommande(c.id); } catch (err: any) { alert(err.response?.data?.error || 'Erreur'); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard compact icon={Clock} theme="blue" label="EN ATTENTE" value={String(enAttente)} />
        <StatCard compact icon={PackageCheck} theme="brand" label="REÇUES" value={String(commandes.filter((c) => c.statut === 'RECUE').length)} />
        <StatCard compact icon={ShoppingBag} theme="violet" label="VALEUR TOTALE" value={`${formatMontant(totalMoisCmds)} HTG`} />
      </div>

      <PageToolbar actionLabel="Nouvelle commande" onAction={() => setModalCreer(true)} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {['N°', 'Date', 'Fournisseur', 'Destination', 'Livraison prévue', 'Lignes', 'Statut', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => {
                const s = STATUT_STYLE[c.statut];
                return (
                  <tr key={c.id}>
                    <td className="font-mono text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>{c.numero}</td>
                    <td className="whitespace-nowrap">{formatRelativeTime(c.dateCommande)}</td>
                    <td className="font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{c.fournisseur.nom}</td>
                    <td className="whitespace-nowrap">{c.emplacement.nom}</td>
                    <td className="whitespace-nowrap">
                      {c.dateLivraisonPrevue ? new Date(c.dateLivraisonPrevue).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="text-center">{c.lignes.length}</td>
                    <td><Badge tone={s.tone}>{s.label}</Badge></td>
                    <td className="whitespace-nowrap space-x-2">
                      {canRecevoir(c) && (
                        <button onClick={() => setCommandeReception(c)} className="text-xs font-semibold inline-flex items-center gap-1"
                          style={{ color: 'var(--color-primary-2)' }}>
                          <Truck className="w-3.5 h-3.5" /> Réceptionner
                        </button>
                      )}
                      {canEnvoyer(c) && (
                        <button onClick={() => handleEnvoyer(c)} className="text-xs font-semibold" style={{ color: 'var(--color-info)' }}>
                          Envoyer
                        </button>
                      )}
                      {canAnnuler(c) && (
                        <button onClick={() => handleAnnuler(c)} className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && commandes.length === 0 && (
          <EmptyState icon={ShoppingBag} title="Aucune commande" hint="Créez votre première commande d'achat ci-dessus." />
        )}
      </div>

      <Modal open={modalCreer} onClose={() => setModalCreer(false)} title="Nouvelle commande d'achat" maxWidth={700}>
        <NouvelleCommandeModal onDone={() => setModalCreer(false)} />
      </Modal>

      <Modal open={!!commandeReception} onClose={() => setCommandeReception(null)} title="Réceptionner la commande" maxWidth={700}>
        {commandeReception && <ReceptionModal commande={commandeReception} onDone={() => setCommandeReception(null)} />}
      </Modal>
    </div>
  );
}
