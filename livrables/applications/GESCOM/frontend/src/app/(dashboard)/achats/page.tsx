'use client';
import { useEffect, useState } from 'react';
import { Truck, Clock, PackageCheck, ShoppingBag } from 'lucide-react';
import { useAchatStore, Commande } from '@/stores/achatStore';
import { formatMontant, formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import NouvelleCommandeModal from '@/components/achats/NouvelleCommandeModal';
import ReceptionModal from '@/components/achats/ReceptionModal';

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  BROUILLON: { bg: 'var(--color-line-2)', fg: 'var(--color-ink-2)', label: 'Brouillon' },
  ENVOYEE: { bg: '#eff6ff', fg: '#2563eb', label: 'Envoyée' },
  RECUE_PARTIELLE: { bg: 'var(--color-warning-soft)', fg: 'var(--color-warning)', label: 'Partielle' },
  RECUE: { bg: 'var(--color-success-soft)', fg: 'var(--color-success)', label: 'Reçue' },
  ANNULEE: { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)', label: 'Annulée' },
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
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 card-accent-blue">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>EN ATTENTE</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{enAttente}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-accent-green">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>REÇUES</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{commandes.filter((c) => c.statut === 'RECUE').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-accent-violet">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>VALEUR TOTALE</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{formatMontant(totalMoisCmds)} HTG</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-ink-2)' }}>Toutes les commandes</h2>
        <button onClick={() => setModalCreer(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
          + Nouvelle commande
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-line-2)' }}>
                {['N°', 'Date', 'Fournisseur', 'Destination', 'Livraison prévue', 'Lignes', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => {
                const s = STATUT_STYLE[c.statut];
                return (
                  <tr key={c.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>{c.numero}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{formatRelativeTime(c.dateCommande)}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{c.fournisseur.nom}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{c.emplacement.nom}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>
                      {c.dateLivraisonPrevue ? new Date(c.dateLivraisonPrevue).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center" style={{ color: 'var(--color-ink-2)' }}>{c.lignes.length}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap space-x-2">
                      {canRecevoir(c) && (
                        <button onClick={() => setCommandeReception(c)} className="text-xs font-semibold inline-flex items-center gap-1"
                          style={{ color: 'var(--color-primary-2)' }}>
                          <Truck className="w-3.5 h-3.5" /> Réceptionner
                        </button>
                      )}
                      {canEnvoyer(c) && (
                        <button onClick={() => handleEnvoyer(c)} className="text-xs font-semibold" style={{ color: '#2563eb' }}>
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
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-ink-3)' }}>
            Aucune commande. Créez votre première commande d&apos;achat ci-dessus.
          </div>
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
