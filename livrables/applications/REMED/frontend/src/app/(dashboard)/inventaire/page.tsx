'use client';
import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, CheckCircle2, Ban } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Inventaire, TypeInventaire, StatutInventaire, LotProduit } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

const STATUT_TONE: Record<StatutInventaire, 'neutral' | 'success' | 'danger'> = {
  EN_COURS: 'neutral',
  VALIDE: 'success',
  ANNULE: 'danger',
};

const STATUT_LABEL: Record<StatutInventaire, string> = {
  EN_COURS: 'En cours',
  VALIDE: 'Validé',
  ANNULE: 'Annulé',
};

export default function InventairePage() {
  const [inventaires, setInventaires] = useState<Inventaire[]>([]);
  const [lots, setLots] = useState<LotProduit[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');

  const [modalCreation, setModalCreation] = useState(false);
  const [type, setType] = useState<TypeInventaire>('COMPLET');
  const [lotIds, setLotIds] = useState<string[]>([]);
  const [enregistrement, setEnregistrement] = useState(false);

  const [detail, setDetail] = useState<Inventaire | null>(null);
  const [quantites, setQuantites] = useState<Record<string, string>>({});

  async function charger() {
    setChargement(true);
    try {
      const [iRes, lRes] = await Promise.all([api.get('/inventaire', { params: { limit: 100 } }), api.get('/stock/lots')]);
      setInventaires(iRes.data.data);
      setLots(lRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les inventaires'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = useMemo(() => inventaires.filter((i) => i.numero.toLowerCase().includes(recherche.toLowerCase())), [inventaires, recherche]);

  function ouvrirCreation() {
    setType('COMPLET');
    setLotIds([]);
    setError('');
    setModalCreation(true);
  }

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/inventaire', { type, lotIds: type === 'PARTIEL' ? lotIds : undefined });
      setModalCreation(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible de créer l'inventaire"));
    } finally {
      setEnregistrement(false);
    }
  }

  function ouvrirDetail(inv: Inventaire) {
    setDetail(inv);
    setQuantites(Object.fromEntries(inv.lignes.map((l) => [l.id, l.quantiteReelle != null ? String(l.quantiteReelle) : ''])));
    setError('');
  }

  async function enregistrerQuantites() {
    if (!detail) return;
    setEnregistrement(true);
    setError('');
    try {
      const lignes = Object.entries(quantites)
        .filter(([, v]) => v !== '')
        .map(([itemId, v]) => ({ itemId, quantiteReelle: Number(v) }));
      const { data } = await api.patch(`/inventaire/${detail.id}/quantites`, { lignes });
      setDetail(data.data);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer les quantités"));
    } finally {
      setEnregistrement(false);
    }
  }

  async function valider() {
    if (!detail) return;
    setEnregistrement(true);
    setError('');
    try {
      const { data } = await api.post(`/inventaire/${detail.id}/valider`);
      setDetail(data.data);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible de valider l'inventaire"));
    } finally {
      setEnregistrement(false);
    }
  }

  async function annuler() {
    if (!detail) return;
    try {
      await api.post(`/inventaire/${detail.id}/annuler`);
      setDetail(null);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'annuler l'inventaire"));
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar search={recherche} onSearch={setRecherche} searchPlaceholder="N° d'inventaire..." actionLabel="Nouvel inventaire" onAction={ouvrirCreation} />

      {error && !detail && !modalCreation && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card overflow-hidden">
        {!chargement && filtres.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Aucun inventaire" hint="Lancez un comptage complet ou partiel du stock" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Type</th>
                  <th>Lignes</th>
                  <th>Statut</th>
                  <th>Créé par</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((inv) => (
                  <tr key={inv.id} className="cursor-pointer" onClick={() => ouvrirDetail(inv)}>
                    <td className="font-medium" style={{ color: 'var(--color-ink)' }}>{inv.numero}</td>
                    <td>{inv.type === 'COMPLET' ? 'Complet' : 'Partiel'}</td>
                    <td>{inv.lignes.length}</td>
                    <td><Badge tone={STATUT_TONE[inv.statut]}>{STATUT_LABEL[inv.statut]}</Badge></td>
                    <td>{inv.creePar.prenom} {inv.creePar.nom}</td>
                    <td>{new Date(inv.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalCreation} onClose={() => setModalCreation(false)} title="Nouvel inventaire" maxWidth={560}>
        <form onSubmit={creer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as TypeInventaire)}>
              <option value="COMPLET">Complet — tous les lots en stock</option>
              <option value="PARTIEL">Partiel — sélection de lots</option>
            </select>
          </div>

          {type === 'PARTIEL' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Lots à inventorier</label>
              <div className="max-h-64 overflow-y-auto rounded-xl border" style={{ borderColor: 'var(--color-line-2)' }}>
                {lots.map((lot) => (
                  <label key={lot.id} className="flex items-center gap-2 px-3 py-2 text-sm border-b last:border-b-0" style={{ borderColor: 'var(--color-line-2)' }}>
                    <input
                      type="checkbox"
                      checked={lotIds.includes(lot.id)}
                      onChange={(e) => setLotIds((prev) => (e.target.checked ? [...prev, lot.id] : prev.filter((id) => id !== lot.id)))}
                    />
                    <span>{lot.numeroLot} — qté {lot.quantiteActuelle}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalCreation(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Création...' : "Créer l'inventaire"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Inventaire ${detail.numero}` : ''} maxWidth={640}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Créé par {detail.creePar.prenom} {detail.creePar.nom} · {new Date(detail.createdAt).toLocaleDateString('fr-FR')}</p>
              <Badge tone={STATUT_TONE[detail.statut]}>{STATUT_LABEL[detail.statut]}</Badge>
            </div>

            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Lot</th>
                  <th>Théorique</th>
                  <th>Réel</th>
                  <th>Écart</th>
                </tr>
              </thead>
              <tbody>
                {detail.lignes.map((l) => {
                  const reel = quantites[l.id];
                  const ecart = reel !== '' && reel !== undefined ? Number(reel) - l.quantiteTheorique : null;
                  return (
                    <tr key={l.id}>
                      <td>{l.lot.produit.nom}{l.lot.produit.dosage ? ` — ${l.lot.produit.dosage}` : ''}</td>
                      <td>{l.lot.numeroLot}</td>
                      <td>{l.quantiteTheorique}</td>
                      <td>
                        {detail.statut === 'EN_COURS' ? (
                          <input
                            type="number"
                            min={0}
                            className="input w-24"
                            value={quantites[l.id] ?? ''}
                            onChange={(e) => setQuantites((prev) => ({ ...prev, [l.id]: e.target.value }))}
                          />
                        ) : (
                          l.quantiteReelle ?? '—'
                        )}
                      </td>
                      <td style={ecart && ecart !== 0 ? { color: ecart > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 } : undefined}>
                        {ecart !== null ? (ecart > 0 ? `+${ecart}` : ecart) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

            {detail.statut === 'EN_COURS' && (
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button className="btn btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={annuler}>
                  <Ban className="w-4 h-4" /> Annuler l&apos;inventaire
                </button>
                <button className="btn btn-secondary" disabled={enregistrement} onClick={enregistrerQuantites}>
                  Enregistrer les quantités
                </button>
                <button className="btn btn-primary" disabled={enregistrement} onClick={valider}>
                  <CheckCircle2 className="w-4 h-4" /> Valider (applique les ajustements)
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
