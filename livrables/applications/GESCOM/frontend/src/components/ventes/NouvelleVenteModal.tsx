'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { useProduitStore, Produit } from '@/stores/produitStore';
import { useClientStore } from '@/stores/clientStore';
import { useEmplacementStore } from '@/stores/emplacementStore';
import { useVenteStore, VenteInput } from '@/stores/venteStore';
import { useAuthStore } from '@/stores/authStore';
import { formatMontant } from '@/lib/utils';

interface Ligne {
  produit: Produit;
  quantite: number;
  prixUnitaire: number;
}

interface NouvelleVenteModalProps {
  onDone: () => void;
}

const MODE_LABELS = { ESPECES: 'Espèces', CHEQUE: 'Chèque', VIREMENT: 'Virement', CREDIT: 'Crédit' };

export default function NouvelleVenteModal({ onDone }: NouvelleVenteModalProps) {
  const { produits, fetchProduits } = useProduitStore();
  const { clients, fetchClients } = useClientStore();
  const { emplacements, fetchEmplacements } = useEmplacementStore();
  const { createVente } = useVenteStore();
  const { utilisateur } = useAuthStore();

  const [recherche, setRecherche] = useState('');
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [emplacementId, setEmplacementId] = useState('');
  const [clientId, setClientId] = useState('');
  const [modePaiement, setModePaiement] = useState<'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'CREDIT'>('ESPECES');
  const [montantPaye, setMontantPaye] = useState('');
  const [activeTab, setActiveTab] = useState<'produits' | 'panier'>('produits');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduits();
    fetchClients();
    fetchEmplacements();
  }, [fetchProduits, fetchClients, fetchEmplacements]);

  // Pré-sélectionner l'emplacement de l'utilisateur connecté
  useEffect(() => {
    if (utilisateur?.emplacementId) setEmplacementId(utilisateur.emplacementId);
    else if (emplacements.length > 0) setEmplacementId(emplacements[0].id);
  }, [utilisateur, emplacements]);

  const produitsFiltres = produits.filter((p) =>
    p.actif && (
      p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      p.reference.toLowerCase().includes(recherche.toLowerCase())
    )
  );

  const montantTotal = lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);

  const ajouterProduit = (produit: Produit) => {
    setLignes((prev) => {
      const exist = prev.find((l) => l.produit.id === produit.id);
      if (exist) {
        return prev.map((l) => l.produit.id === produit.id ? { ...l, quantite: l.quantite + 1 } : l);
      }
      const prix = produit.stocks?.some((s) => {
        const emp = emplacements.find((e) => e.id === emplacementId);
        return s.emplacement.id === emplacementId && emp?.type === 'ENTREPOT';
      })
        ? Number(produit.prixVenteGros || produit.prixVenteDetail)
        : Number(produit.prixVenteDetail);
      return [...prev, { produit, quantite: 1, prixUnitaire: prix }];
    });
    setActiveTab('panier');
  };

  const setQuantite = (produitId: string, q: number) => {
    if (q <= 0) {
      setLignes((prev) => prev.filter((l) => l.produit.id !== produitId));
    } else {
      setLignes((prev) => prev.map((l) => l.produit.id === produitId ? { ...l, quantite: q } : l));
    }
  };

  const setPrix = (produitId: string, prix: number) => {
    setLignes((prev) => prev.map((l) => l.produit.id === produitId ? { ...l, prixUnitaire: prix } : l));
  };

  const handleSubmit = async () => {
    setError('');
    if (lignes.length === 0) { setError('Ajoutez au moins un produit'); return; }
    if (!emplacementId) { setError('Sélectionnez un emplacement'); return; }
    if (modePaiement === 'CREDIT' && !clientId) { setError('Sélectionnez un client pour une vente à crédit'); return; }

    setSubmitting(true);
    try {
      const payload: VenteInput = {
        emplacementId,
        clientId: clientId || undefined,
        modePaiement,
        montantPaye: modePaiement === 'CREDIT' ? (Number(montantPaye) || 0) : undefined,
        lignes: lignes.map((l) => ({ produitId: l.produit.id, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
      };
      await createVente(payload);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la vente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Emplacement + Client */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Emplacement</label>
          <select className="input" value={emplacementId} onChange={(e) => setEmplacementId(e.target.value)}>
            <option value="">Choisir...</option>
            {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Client (optionnel)</label>
          <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Client comptant</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom} ({c.type === 'GROSSISTE' ? 'Grossiste' : 'Particulier'})</option>)}
          </select>
        </div>
      </div>

      {/* Tabs mobile */}
      <div className="flex gap-1 p-1 rounded-xl sm:hidden" style={{ background: 'var(--color-line-2)' }}>
        {(['produits', 'panier'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors"
            style={{
              background: activeTab === t ? 'var(--color-surface)' : 'transparent',
              color: activeTab === t ? 'var(--color-ink)' : 'var(--color-ink-3)',
            }}
          >
            {t === 'produits' ? 'Produits' : `Panier (${lignes.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Colonne produits */}
        <div className={activeTab === 'panier' ? 'hidden sm:block' : ''}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
            <input
              className="input pl-9"
              placeholder="Rechercher un produit..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {produitsFiltres.map((p) => {
              const stockEmp = p.stocks?.find((s) => s.emplacement.id === emplacementId);
              const dispo = stockEmp?.quantite ?? 0;
              return (
                <button
                  key={p.id}
                  onClick={() => ajouterProduit(p)}
                  disabled={dispo === 0}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all"
                  style={{
                    background: 'var(--color-line-2)',
                    opacity: dispo === 0 ? 0.5 : 1,
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{formatMontant(p.prixVenteDetail)} HTG · {dispo} {p.unite}</p>
                  </div>
                  <Plus className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-2)' }} />
                </button>
              );
            })}
            {produitsFiltres.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--color-ink-3)' }}>Aucun produit trouvé</p>
            )}
          </div>
        </div>

        {/* Colonne panier */}
        <div className={activeTab === 'produits' ? 'hidden sm:block' : ''}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {lignes.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucun produit ajouté</p>
            )}
            {lignes.map((l) => (
              <div key={l.produit.id} className="p-3 rounded-xl" style={{ background: 'var(--color-line-2)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{l.produit.nom}</p>
                  <button onClick={() => setQuantite(l.produit.id, 0)}>
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQuantite(l.produit.id, l.quantite - 1)}
                      className="w-7 h-7 rounded-lg text-sm font-bold"
                      style={{ background: 'var(--color-surface)', color: 'var(--color-ink)' }}
                    >−</button>
                    <input
                      type="number"
                      min={1}
                      value={l.quantite}
                      onChange={(e) => setQuantite(l.produit.id, Number(e.target.value))}
                      className="w-12 text-center text-sm font-semibold rounded-lg px-1 py-0.5"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}
                    />
                    <button
                      onClick={() => setQuantite(l.produit.id, l.quantite + 1)}
                      className="w-7 h-7 rounded-lg text-sm font-bold"
                      style={{ background: 'var(--color-surface)', color: 'var(--color-ink)' }}
                    >+</button>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>×</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.prixUnitaire}
                    onChange={(e) => setPrix(l.produit.id, Number(e.target.value))}
                    className="flex-1 text-sm text-right rounded-lg px-2 py-0.5"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}
                  />
                  <span className="text-xs shrink-0" style={{ color: 'var(--color-ink-3)' }}>HTG</span>
                </div>
                <p className="text-xs text-right mt-1.5 font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {formatMontant(l.quantite * l.prixUnitaire)} HTG
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode paiement + total */}
      <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-ink-2)' }}>Mode de paiement</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(MODE_LABELS) as (keyof typeof MODE_LABELS)[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModePaiement(m)}
                className="py-2 rounded-xl text-xs font-bold transition-colors"
                style={{
                  background: modePaiement === m ? 'var(--color-primary-soft)' : 'var(--color-line-2)',
                  color: modePaiement === m ? 'var(--color-primary-2)' : 'var(--color-ink-2)',
                }}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {modePaiement === 'CREDIT' && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Montant payé maintenant (HTG)</label>
            <input
              type="number"
              min={0}
              className="input"
              placeholder="0"
              value={montantPaye}
              onChange={(e) => setMontantPaye(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-semibold" style={{ color: 'var(--color-ink-2)' }}>Total</span>
          <span className="text-2xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{formatMontant(montantTotal)} HTG</span>
        </div>

        {modePaiement === 'CREDIT' && montantPaye && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-ink-2)' }}>Solde dû</span>
            <span className="font-bold" style={{ color: 'var(--color-danger)' }}>
              {formatMontant(Math.max(0, montantTotal - Number(montantPaye)))} HTG
            </span>
          </div>
        )}

        {error && (
          <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || lignes.length === 0}
          className="w-full py-3.5 rounded-2xl font-bold text-base text-white disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}
        >
          {submitting ? 'Enregistrement...' : `Valider la vente · ${formatMontant(montantTotal)} HTG`}
        </button>
      </div>
    </div>
  );
}
