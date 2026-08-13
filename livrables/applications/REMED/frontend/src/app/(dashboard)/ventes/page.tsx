'use client';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, Wallet, Lock, Unlock, Receipt, Ban, Printer } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Produit, Client, CaisseSession, Vente, ModePaiement, Ordonnance } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';

interface LignePanier {
  produitId: string;
  nom: string;
  dosage?: string | null;
  prixVente: number;
  quantite: number;
  necessiteOrdonnance: boolean;
  quantiteTotal: number;
}

const MODES: { value: ModePaiement; label: string }[] = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'CARTE', label: 'Carte' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'VIREMENT', label: 'Virement' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'CREDIT', label: 'Crédit' },
  { value: 'AUTRE', label: 'Autre' },
];

const CAN_ANNULER = ['SUPER_ADMIN', 'GERANT', 'PHARMACIEN'];

function formatHTG(v: string | number) {
  return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG', maximumFractionDigits: 2 }).format(Number(v));
}

export default function VentesPage() {
  const { utilisateur } = useAuthStore();
  const [caisse, setCaisse] = useState<CaisseSession | null | undefined>(undefined);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [recentes, setRecentes] = useState<Vente[]>([]);
  const [recherche, setRecherche] = useState('');
  const [panier, setPanier] = useState<LignePanier[]>([]);
  const [clientId, setClientId] = useState('');
  const [remise, setRemise] = useState('0');
  const [paiements, setPaiements] = useState<{ mode: ModePaiement; montant: string }[]>([{ mode: 'ESPECES', montant: '0' }]);
  const [ordonnance, setOrdonnance] = useState({ medecinNom: '', patientNom: '', patientTelephone: '', dateEmission: '' });
  const [ordonnancesDisponibles, setOrdonnancesDisponibles] = useState<Ordonnance[]>([]);
  const [modeOrdonnance, setModeOrdonnance] = useState<'nouvelle' | 'existante'>('nouvelle');
  const [ordonnanceSelectionneeId, setOrdonnanceSelectionneeId] = useState('');
  const [error, setError] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [recu, setRecu] = useState<Vente | null>(null);

  const [modalOuverture, setModalOuverture] = useState(false);
  const [montantOuverture, setMontantOuverture] = useState('0');
  const [modalFermeture, setModalFermeture] = useState(false);
  const [montantFermeture, setMontantFermeture] = useState('0');
  const [motifAnnulation, setMotifAnnulation] = useState<{ venteId: string; motif: string } | null>(null);

  async function chargerTout() {
    try {
      const [caisseRes, produitsRes, clientsRes, ventesRes, ordonnancesRes] = await Promise.all([
        api.get('/caisse/active'),
        api.get('/produits'),
        api.get('/clients'),
        api.get('/ventes', { params: { limit: 10 } }),
        api.get('/ordonnances/disponibles'),
      ]);
      setCaisse(caisseRes.data.data);
      setProduits(produitsRes.data.data);
      setClients(clientsRes.data.data);
      setRecentes(ventesRes.data.data);
      setOrdonnancesDisponibles(ordonnancesRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger la page de vente'));
    }
  }

  useEffect(() => {
    chargerTout();
  }, []);

  const sousTotal = useMemo(() => panier.reduce((s, l) => s + l.quantite * l.prixVente, 0), [panier]);
  const total = useMemo(() => Math.max(0, sousTotal - Number(remise || 0)), [sousTotal, remise]);
  const ordonnanceRequise = useMemo(() => panier.some((l) => l.necessiteOrdonnance), [panier]);
  const totalPaiements = useMemo(() => paiements.reduce((s, p) => s + Number(p.montant || 0), 0), [paiements]);

  useEffect(() => {
    if (paiements.length === 1) {
      setPaiements([{ ...paiements[0], montant: total.toFixed(2) }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const produitsFiltres = useMemo(() => {
    if (!recherche) return [];
    const q = recherche.toLowerCase();
    return produits.filter((p) => p.nom.toLowerCase().includes(q) || p.codeBarres?.toLowerCase().includes(q) || p.dci?.toLowerCase().includes(q)).slice(0, 8);
  }, [recherche, produits]);

  function ajouterAuPanier(p: Produit) {
    setPanier((prev) => {
      const existe = prev.find((l) => l.produitId === p.id);
      if (existe) {
        return prev.map((l) => (l.produitId === p.id ? { ...l, quantite: l.quantite + 1 } : l));
      }
      return [
        ...prev,
        {
          produitId: p.id,
          nom: p.nom,
          dosage: p.dosage,
          prixVente: Number(p.prixVente),
          quantite: 1,
          necessiteOrdonnance: p.necessiteOrdonnance,
          quantiteTotal: p.quantiteTotal,
        },
      ];
    });
    setRecherche('');
  }

  function modifierQuantite(produitId: string, delta: number) {
    setPanier((prev) =>
      prev
        .map((l) => (l.produitId === produitId ? { ...l, quantite: Math.max(1, l.quantite + delta) } : l))
        .filter((l) => l.quantite > 0)
    );
  }

  function retirer(produitId: string) {
    setPanier((prev) => prev.filter((l) => l.produitId !== produitId));
  }

  function ajouterPaiement() {
    setPaiements((prev) => [...prev, { mode: 'ESPECES', montant: '0' }]);
  }

  function reinitialiser() {
    setPanier([]);
    setClientId('');
    setRemise('0');
    setPaiements([{ mode: 'ESPECES', montant: '0' }]);
    setOrdonnance({ medecinNom: '', patientNom: '', patientTelephone: '', dateEmission: '' });
    setModeOrdonnance('nouvelle');
    setOrdonnanceSelectionneeId('');
  }

  async function finaliser() {
    setEnregistrement(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        clientId: clientId || undefined,
        lignes: panier.map((l) => ({ produitId: l.produitId, quantite: l.quantite })),
        remise: Number(remise || 0),
        paiements: paiements.map((p) => ({ mode: p.mode, montant: Number(p.montant) })),
      };
      if (ordonnanceRequise) {
        if (modeOrdonnance === 'existante') {
          payload.ordonnanceId = ordonnanceSelectionneeId;
        } else {
          payload.ordonnance = {
            medecinNom: ordonnance.medecinNom,
            patientNom: ordonnance.patientNom,
            patientTelephone: ordonnance.patientTelephone || undefined,
            dateEmission: ordonnance.dateEmission,
          };
        }
      }
      const { data } = await api.post('/ventes', payload);
      setRecu(data.data);
      reinitialiser();
      await chargerTout();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer la vente"));
    } finally {
      setEnregistrement(false);
    }
  }

  async function ouvrirCaisse(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/caisse/ouvrir', { montantOuverture: Number(montantOuverture) });
      setModalOuverture(false);
      setMontantOuverture('0');
      await chargerTout();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'ouvrir la caisse"));
    }
  }

  async function fermerCaisse(e: React.FormEvent) {
    e.preventDefault();
    if (!caisse) return;
    setError('');
    try {
      await api.post(`/caisse/${caisse.id}/fermer`, { montantFermeture: Number(montantFermeture) });
      setModalFermeture(false);
      setMontantFermeture('0');
      await chargerTout();
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de fermer la caisse'));
    }
  }

  async function annulerVente() {
    if (!motifAnnulation) return;
    try {
      await api.post(`/ventes/${motifAnnulation.venteId}/annuler`, { motif: motifAnnulation.motif });
      setMotifAnnulation(null);
      await chargerTout();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'annuler la vente"));
    }
  }

  const peutAnnuler = utilisateur ? CAN_ANNULER.includes(utilisateur.role) : false;

  // Ouvre la facture 80mm dans un nouvel onglet, prête à imprimer (Ctrl+P) ou télécharger.
  // Le cookie httpOnly d'auth part automatiquement avec la navigation directe.
  function ouvrirFacture(venteId: string) {
    window.open(`${api.defaults.baseURL}/ventes/${venteId}/facture.pdf`, '_blank');
  }

  if (caisse === undefined) return null;

  return (
    <div className="space-y-5">
      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        {caisse ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: 'var(--gradient-brand)' }}>
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                  Caisse ouverte par {caisse.ouvertePar.prenom} {caisse.ouvertePar.nom}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
                  Depuis {new Date(caisse.ouverteLe).toLocaleTimeString('fr-FR')} · Fond initial {formatHTG(caisse.montantOuverture)}
                </p>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setModalFermeture(true)}>
              <Lock className="w-4 h-4" />
              Fermer la caisse
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Aucune caisse ouverte — la vente est bloquée</p>
            </div>
            <button className="btn btn-primary" onClick={() => setModalOuverture(true)}>
              <Wallet className="w-4 h-4" />
              Ouvrir la caisse
            </button>
          </>
        )}
      </div>

      {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      {caisse && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-ink-3)' }} />
              <input
                className="input pl-10"
                placeholder="Rechercher un produit ou scanner un code-barres..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                autoFocus
              />
              {produitsFiltres.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-line)' }}>
                  {produitsFiltres.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => ajouterAuPanier(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-[var(--color-surface-2)]"
                    >
                      <span>{p.nom}{p.dosage ? ` — ${p.dosage}` : ''}</span>
                      <span className="flex items-center gap-2">
                        {p.necessiteOrdonnance && <Badge tone="info">Ordonnance</Badge>}
                        <span className="font-semibold">{formatHTG(p.prixVente)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card overflow-hidden">
              {panier.length === 0 ? (
                <EmptyState icon={ShoppingCart} title="Panier vide" hint="Recherchez un produit ci-dessus pour l'ajouter" />
              ) : (
                <table className="table-shell w-full">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Prix</th>
                      <th>Qté</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {panier.map((l) => (
                      <tr key={l.produitId}>
                        <td>
                          <div className="font-medium" style={{ color: 'var(--color-ink)' }}>{l.nom}{l.dosage ? ` — ${l.dosage}` : ''}</div>
                          {l.necessiteOrdonnance && <Badge tone="info">Ordonnance requise</Badge>}
                        </td>
                        <td>{formatHTG(l.prixVente)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }} onClick={() => modifierQuantite(l.produitId, -1)}>
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center">{l.quantite}</span>
                            <button className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }} onClick={() => modifierQuantite(l.produitId, 1)}>
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="font-semibold">{formatHTG(l.quantite * l.prixVente)}</td>
                        <td>
                          <button onClick={() => retirer(l.produitId)} style={{ color: 'var(--color-danger)' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-line-2)' }}>
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Ventes récentes</h3>
              </div>
              {recentes.length === 0 ? (
                <p className="text-xs p-4" style={{ color: 'var(--color-ink-3)' }}>Aucune vente pour l&apos;instant</p>
              ) : (
                <table className="table-shell w-full">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Heure</th>
                      <th>Total</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentes.map((v) => (
                      <tr key={v.id}>
                        <td>{v.numero}</td>
                        <td>{new Date(v.createdAt).toLocaleTimeString('fr-FR')}</td>
                        <td className="font-semibold">{formatHTG(v.montantTotal)}</td>
                        <td><Badge tone={v.statut === 'ANNULEE' ? 'danger' : 'success'}>{v.statut === 'ANNULEE' ? 'Annulée' : 'Complétée'}</Badge></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => ouvrirFacture(v.id)} style={{ color: 'var(--color-primary-2)' }} title="Facture 80mm">
                              <Printer className="w-4 h-4" />
                            </button>
                            {peutAnnuler && v.statut === 'COMPLETEE' && (
                              <button onClick={() => setMotifAnnulation({ venteId: v.id, motif: '' })} style={{ color: 'var(--color-danger)' }} title="Annuler">
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="card p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Client (optionnel)</label>
                <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">Client de passage</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>
                  ))}
                </select>
              </div>

              {ordonnanceRequise && (
                <div className="space-y-3 p-3 rounded-xl" style={{ background: 'var(--color-info-soft)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-info)' }}>Ordonnance requise pour cette vente</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary flex-1"
                      style={modeOrdonnance === 'nouvelle' ? { background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' } : undefined}
                      onClick={() => setModeOrdonnance('nouvelle')}
                    >
                      Nouvelle
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary flex-1"
                      style={modeOrdonnance === 'existante' ? { background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' } : undefined}
                      onClick={() => setModeOrdonnance('existante')}
                    >
                      Ordonnance existante
                    </button>
                  </div>

                  {modeOrdonnance === 'nouvelle' ? (
                    <>
                      <input className="input" placeholder="Nom du médecin" value={ordonnance.medecinNom} onChange={(e) => setOrdonnance({ ...ordonnance, medecinNom: e.target.value })} />
                      <input className="input" placeholder="Nom du patient" value={ordonnance.patientNom} onChange={(e) => setOrdonnance({ ...ordonnance, patientNom: e.target.value })} />
                      <input className="input" placeholder="Téléphone du patient (optionnel)" value={ordonnance.patientTelephone} onChange={(e) => setOrdonnance({ ...ordonnance, patientTelephone: e.target.value })} />
                      <input type="date" className="input" value={ordonnance.dateEmission} onChange={(e) => setOrdonnance({ ...ordonnance, dateEmission: e.target.value })} />
                    </>
                  ) : (
                    <select className="input" value={ordonnanceSelectionneeId} onChange={(e) => setOrdonnanceSelectionneeId(e.target.value)}>
                      <option value="">Sélectionner une ordonnance...</option>
                      {ordonnancesDisponibles.map((o) => (
                        <option key={o.id} value={o.id}>{o.numero} — {o.patientNom}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Remise (HTG)</label>
                <input type="number" min={0} step="0.01" className="input" value={remise} onChange={(e) => setRemise(e.target.value)} />
              </div>

              <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--color-ink-2)' }}>
                  <span>Sous-total</span>
                  <span>{formatHTG(sousTotal)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--color-ink-2)' }}>
                  <span>Remise</span>
                  <span>- {formatHTG(remise || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
                  <span>Total</span>
                  <span>{formatHTG(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Paiement</p>
                {paiements.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      className="input"
                      value={p.mode}
                      onChange={(e) => setPaiements((prev) => prev.map((pp, ii) => (ii === i ? { ...pp, mode: e.target.value as ModePaiement } : pp)))}
                    >
                      {MODES.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="input"
                      value={p.montant}
                      onChange={(e) => setPaiements((prev) => prev.map((pp, ii) => (ii === i ? { ...pp, montant: e.target.value } : pp)))}
                    />
                    {paiements.length > 1 && (
                      <button type="button" onClick={() => setPaiements((prev) => prev.filter((_, ii) => ii !== i))} style={{ color: 'var(--color-danger)' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={ajouterPaiement} className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>
                  + Ajouter un mode de paiement
                </button>
                {Math.abs(totalPaiements - total) > 0.01 && (
                  <p className="text-xs" style={{ color: 'var(--color-warning)' }}>
                    Total des paiements ({formatHTG(totalPaiements)}) ≠ total de la vente ({formatHTG(total)})
                  </p>
                )}
              </div>

              <button
                className="btn btn-primary w-full py-3"
                disabled={
                  panier.length === 0 ||
                  enregistrement ||
                  Math.abs(totalPaiements - total) > 0.01 ||
                  (ordonnanceRequise && modeOrdonnance === 'existante' && !ordonnanceSelectionneeId)
                }
                onClick={finaliser}
              >
                {enregistrement ? 'Enregistrement...' : 'Finaliser la vente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={modalOuverture} onClose={() => setModalOuverture(false)} title="Ouvrir la caisse" maxWidth={420}>
        <form onSubmit={ouvrirCaisse} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Fond de caisse initial (HTG)</label>
            <input type="number" min={0} step="0.01" className="input" required value={montantOuverture} onChange={(e) => setMontantOuverture(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOuverture(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary">Ouvrir</button>
          </div>
        </form>
      </Modal>

      <Modal open={modalFermeture} onClose={() => setModalFermeture(false)} title="Fermer la caisse" maxWidth={420}>
        <form onSubmit={fermerCaisse} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Montant compté en caisse (HTG)</label>
            <input type="number" min={0} step="0.01" className="input" required value={montantFermeture} onChange={(e) => setMontantFermeture(e.target.value)} />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Le solde théorique et l&apos;écart seront calculés automatiquement.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalFermeture(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary">Fermer la caisse</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!motifAnnulation} onClose={() => setMotifAnnulation(null)} title="Annuler la vente" maxWidth={420}>
        {motifAnnulation && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Motif de l&apos;annulation</label>
              <input
                className="input"
                required
                value={motifAnnulation.motif}
                onChange={(e) => setMotifAnnulation({ ...motifAnnulation, motif: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setMotifAnnulation(null)}>Annuler</button>
              <button type="button" className="btn btn-danger" disabled={!motifAnnulation.motif} onClick={annulerVente}>Confirmer l&apos;annulation</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!recu} onClose={() => setRecu(null)} title="Vente enregistrée" maxWidth={420}>
        {recu && (
          <div className="space-y-3">
            <div className="flex items-center gap-2" style={{ color: 'var(--color-primary-2)' }}>
              <Receipt className="w-5 h-5" />
              <span className="font-bold">{recu.numero}</span>
            </div>
            <div className="text-sm space-y-1">
              {recu.lignes.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span>{l.produit.nom} × {l.quantite}</span>
                  <span>{formatHTG(Number(l.prixUnitaire) * l.quantite)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t flex justify-between font-bold text-lg" style={{ borderColor: 'var(--color-line-2)' }}>
              <span>Total</span>
              <span>{formatHTG(recu.montantTotal)}</span>
            </div>
            <button className="btn btn-secondary w-full" onClick={() => ouvrirFacture(recu.id)}>
              <Printer className="w-4 h-4" /> Imprimer la facture (80mm)
            </button>
            <button className="btn btn-primary w-full" onClick={() => setRecu(null)}>Fermer</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
