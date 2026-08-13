'use client';
import { useEffect, useMemo, useState } from 'react';
import { Truck, Plus, Trash2, Send, PackageCheck, Ban } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { CommandeAchat, Fournisseur, Produit, StatutCommandeAchat } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

const STATUT_TONE: Record<StatutCommandeAchat, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = {
  BROUILLON: 'neutral',
  ENVOYEE: 'info',
  RECUE_PARTIELLE: 'warning',
  RECUE_COMPLETE: 'success',
  ANNULEE: 'danger',
};

const STATUT_LABEL: Record<StatutCommandeAchat, string> = {
  BROUILLON: 'Brouillon',
  ENVOYEE: 'Envoyée',
  RECUE_PARTIELLE: 'Reçue (partielle)',
  RECUE_COMPLETE: 'Reçue (complète)',
  ANNULEE: 'Annulée',
};

function formatHTG(v: string | number) {
  return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG', maximumFractionDigits: 2 }).format(Number(v));
}

interface LigneForm {
  produitId: string;
  quantiteCommandee: string;
  prixUnitaire: string;
}

interface LigneReception {
  ligneId: string;
  quantiteRecue: string;
  numeroLot: string;
  dateExpiration: string;
}

export default function AchatsPage() {
  const [commandes, setCommandes] = useState<CommandeAchat[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');

  const [modalCreation, setModalCreation] = useState(false);
  const [fournisseurId, setFournisseurId] = useState('');
  const [lignes, setLignes] = useState<LigneForm[]>([{ produitId: '', quantiteCommandee: '1', prixUnitaire: '0' }]);
  const [enregistrement, setEnregistrement] = useState(false);

  const [detail, setDetail] = useState<CommandeAchat | null>(null);
  const [modeReception, setModeReception] = useState(false);
  const [receptionLignes, setReceptionLignes] = useState<LigneReception[]>([]);

  async function charger() {
    setChargement(true);
    try {
      const [cRes, fRes, pRes] = await Promise.all([
        api.get('/achats', { params: { limit: 100 } }),
        api.get('/fournisseurs'),
        api.get('/produits'),
      ]);
      setCommandes(cRes.data.data);
      setFournisseurs(fRes.data.data);
      setProduits(pRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les commandes'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = useMemo(
    () => commandes.filter((c) => c.numero.toLowerCase().includes(recherche.toLowerCase()) || c.fournisseur.nom.toLowerCase().includes(recherche.toLowerCase())),
    [commandes, recherche]
  );

  function ouvrirCreation() {
    setFournisseurId('');
    setLignes([{ produitId: '', quantiteCommandee: '1', prixUnitaire: '0' }]);
    setError('');
    setModalCreation(true);
  }

  function ajouterLigne() {
    setLignes((prev) => [...prev, { produitId: '', quantiteCommandee: '1', prixUnitaire: '0' }]);
  }

  function majLigne(i: number, patch: Partial<LigneForm>) {
    setLignes((prev) =>
      prev.map((l, ii) => {
        if (ii !== i) return l;
        const next = { ...l, ...patch };
        if (patch.produitId) {
          const p = produits.find((pp) => pp.id === patch.produitId);
          if (p) next.prixUnitaire = p.prixAchat;
        }
        return next;
      })
    );
  }

  async function creerCommande(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/achats', {
        fournisseurId,
        lignes: lignes.map((l) => ({
          produitId: l.produitId,
          quantiteCommandee: Number(l.quantiteCommandee),
          prixUnitaire: Number(l.prixUnitaire),
        })),
      });
      setModalCreation(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de créer la commande'));
    } finally {
      setEnregistrement(false);
    }
  }

  function ouvrirDetail(c: CommandeAchat) {
    setDetail(c);
    setModeReception(false);
    setError('');
  }

  function demarrerReception() {
    if (!detail) return;
    setReceptionLignes(
      detail.lignes
        .filter((l) => l.quantiteRecue < l.quantiteCommandee)
        .map((l) => ({
          ligneId: l.id,
          quantiteRecue: String(l.quantiteCommandee - l.quantiteRecue),
          numeroLot: '',
          dateExpiration: '',
        }))
    );
    setModeReception(true);
  }

  async function envoyer() {
    if (!detail) return;
    try {
      const { data } = await api.post(`/achats/${detail.id}/envoyer`);
      setDetail(data.data);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'envoyer la commande"));
    }
  }

  async function annuler() {
    if (!detail) return;
    try {
      await api.post(`/achats/${detail.id}/annuler`);
      setDetail(null);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'annuler la commande"));
    }
  }

  async function confirmerReception(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;
    setEnregistrement(true);
    setError('');
    try {
      const lignesAEnvoyer = receptionLignes.filter((l) => Number(l.quantiteRecue) > 0);
      if (lignesAEnvoyer.length === 0) throw new Error('Aucune quantité à réceptionner');
      for (const l of lignesAEnvoyer) {
        if (!l.numeroLot || !l.dateExpiration) throw new Error('Numéro de lot et date de péremption requis pour chaque ligne');
      }
      const { data } = await api.post(`/achats/${detail.id}/recevoir`, {
        lignes: lignesAEnvoyer.map((l) => ({
          ligneId: l.ligneId,
          quantiteRecue: Number(l.quantiteRecue),
          numeroLot: l.numeroLot,
          dateExpiration: l.dateExpiration,
        })),
      });
      setDetail(data.data);
      setModeReception(false);
      await charger();
    } catch (err) {
      setError(err instanceof Error && !('response' in err) ? err.message : apiErrorMessage(err, 'Impossible de réceptionner'));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar search={recherche} onSearch={setRecherche} searchPlaceholder="N° commande ou fournisseur..." actionLabel="Nouvelle commande" onAction={ouvrirCreation} />

      {error && !detail && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card overflow-hidden">
        {!chargement && filtres.length === 0 ? (
          <EmptyState icon={Truck} title="Aucune commande d'achat" hint="Créez votre première commande fournisseur" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Fournisseur</th>
                  <th>Lignes</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((c) => (
                  <tr key={c.id} className="cursor-pointer" onClick={() => ouvrirDetail(c)}>
                    <td className="font-medium" style={{ color: 'var(--color-ink)' }}>{c.numero}</td>
                    <td>{c.fournisseur.nom}</td>
                    <td>{c.lignes.length}</td>
                    <td><Badge tone={STATUT_TONE[c.statut]}>{STATUT_LABEL[c.statut]}</Badge></td>
                    <td>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalCreation} onClose={() => setModalCreation(false)} title="Nouvelle commande d'achat" maxWidth={640}>
        <form onSubmit={creerCommande} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Fournisseur</label>
            <select className="input" required value={fournisseurId} onChange={(e) => setFournisseurId(e.target.value)}>
              <option value="">Sélectionner...</option>
              {fournisseurs.map((f) => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Lignes</label>
            {lignes.map((l, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select className="input flex-1" required value={l.produitId} onChange={(e) => majLigne(i, { produitId: e.target.value })}>
                  <option value="">Produit...</option>
                  {produits.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom}{p.dosage ? ` — ${p.dosage}` : ''}</option>
                  ))}
                </select>
                <input type="number" min={1} className="input w-24" required placeholder="Qté" value={l.quantiteCommandee} onChange={(e) => majLigne(i, { quantiteCommandee: e.target.value })} />
                <input type="number" min={0} step="0.01" className="input w-28" required placeholder="Prix" value={l.prixUnitaire} onChange={(e) => majLigne(i, { prixUnitaire: e.target.value })} />
                {lignes.length > 1 && (
                  <button type="button" onClick={() => setLignes((prev) => prev.filter((_, ii) => ii !== i))} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={ajouterLigne} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
              <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
            </button>
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalCreation(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Création...' : 'Créer la commande'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Commande ${detail.numero}` : ''} maxWidth={640}>
        {detail && !modeReception && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{detail.fournisseur.nom}</p>
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Créée par {detail.creePar.prenom} {detail.creePar.nom} · {new Date(detail.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <Badge tone={STATUT_TONE[detail.statut]}>{STATUT_LABEL[detail.statut]}</Badge>
            </div>

            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Commandé</th>
                  <th>Reçu</th>
                  <th>Prix unit.</th>
                </tr>
              </thead>
              <tbody>
                {detail.lignes.map((l) => (
                  <tr key={l.id}>
                    <td>{l.produit.nom}{l.produit.dosage ? ` — ${l.produit.dosage}` : ''}</td>
                    <td>{l.quantiteCommandee}</td>
                    <td>{l.quantiteRecue}</td>
                    <td>{formatHTG(l.prixUnitaire)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {detail.statut === 'BROUILLON' && (
                <button className="btn btn-secondary" onClick={envoyer}>
                  <Send className="w-4 h-4" /> Envoyer au fournisseur
                </button>
              )}
              {(detail.statut === 'BROUILLON' || detail.statut === 'ENVOYEE') && (
                <button className="btn btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={annuler}>
                  <Ban className="w-4 h-4" /> Annuler
                </button>
              )}
              {(detail.statut === 'ENVOYEE' || detail.statut === 'RECUE_PARTIELLE') && (
                <button className="btn btn-primary" onClick={demarrerReception}>
                  <PackageCheck className="w-4 h-4" /> Réceptionner
                </button>
              )}
            </div>
          </div>
        )}

        {detail && modeReception && (
          <form onSubmit={confirmerReception} className="space-y-4">
            <p className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Réception — un numéro de lot et une date de péremption par ligne</p>
            {receptionLignes.map((l, i) => {
              const ligneCommande = detail.lignes.find((dl) => dl.id === l.ligneId)!;
              return (
                <div key={l.ligneId} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--color-surface-2)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{ligneCommande.produit.nom} (reste {ligneCommande.quantiteCommandee - ligneCommande.quantiteRecue})</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" min={0} className="input" placeholder="Qté reçue" value={l.quantiteRecue} onChange={(e) => setReceptionLignes((prev) => prev.map((pl, ii) => (ii === i ? { ...pl, quantiteRecue: e.target.value } : pl)))} />
                    <input className="input" placeholder="N° de lot" value={l.numeroLot} onChange={(e) => setReceptionLignes((prev) => prev.map((pl, ii) => (ii === i ? { ...pl, numeroLot: e.target.value } : pl)))} />
                    <input type="date" className="input" value={l.dateExpiration} onChange={(e) => setReceptionLignes((prev) => prev.map((pl, ii) => (ii === i ? { ...pl, dateExpiration: e.target.value } : pl)))} />
                  </div>
                </div>
              );
            })}

            {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setModeReception(false)}>Retour</button>
              <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Confirmer la réception'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
