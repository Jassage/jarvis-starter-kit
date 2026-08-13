'use client';
import { useEffect, useMemo, useState } from 'react';
import { FileText, Trash2, Plus, Paperclip, Ban } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Ordonnance, Produit, Client } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

const STATUT_TONE: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  ENREGISTREE: 'neutral',
  PARTIELLEMENT_SERVIE: 'warning',
  SERVIE: 'success',
  ANNULEE: 'danger',
};

const STATUT_LABEL: Record<string, string> = {
  ENREGISTREE: 'Enregistrée',
  PARTIELLEMENT_SERVIE: 'Partiellement servie',
  SERVIE: 'Servie',
  ANNULEE: 'Annulée',
};

interface ItemForm {
  produitId: string;
  medicamentNom: string;
  dosage: string;
  posologie: string;
  dureeJours: string;
  quantitePrescrite: string;
  instructions: string;
}

const itemVide = (): ItemForm => ({ produitId: '', medicamentNom: '', dosage: '', posologie: '', dureeJours: '', quantitePrescrite: '1', instructions: '' });

export default function OrdonnancesPage() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');

  const [modalCreation, setModalCreation] = useState(false);
  const [medecinNom, setMedecinNom] = useState('');
  const [patientNom, setPatientNom] = useState('');
  const [patientTelephone, setPatientTelephone] = useState('');
  const [clientId, setClientId] = useState('');
  const [dateEmission, setDateEmission] = useState('');
  const [items, setItems] = useState<ItemForm[]>([itemVide()]);
  const [enregistrement, setEnregistrement] = useState(false);

  const [detail, setDetail] = useState<Ordonnance | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);

  async function charger() {
    setChargement(true);
    try {
      const [oRes, pRes, cRes] = await Promise.all([
        api.get('/ordonnances', { params: { limit: 100 } }),
        api.get('/produits'),
        api.get('/clients'),
      ]);
      setOrdonnances(oRes.data.data);
      setProduits(pRes.data.data);
      setClients(cRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les ordonnances'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = useMemo(
    () => ordonnances.filter((o) => o.numero.toLowerCase().includes(recherche.toLowerCase()) || o.patientNom.toLowerCase().includes(recherche.toLowerCase())),
    [ordonnances, recherche]
  );

  function ouvrirCreation() {
    setMedecinNom('');
    setPatientNom('');
    setPatientTelephone('');
    setClientId('');
    setDateEmission(new Date().toISOString().slice(0, 10));
    setItems([itemVide()]);
    setError('');
    setModalCreation(true);
  }

  function majItem(i: number, patch: Partial<ItemForm>) {
    setItems((prev) =>
      prev.map((it, ii) => {
        if (ii !== i) return it;
        const next = { ...it, ...patch };
        if (patch.produitId) {
          const p = produits.find((pp) => pp.id === patch.produitId);
          if (p) next.medicamentNom = `${p.nom}${p.dosage ? ` ${p.dosage}` : ''}`;
        }
        return next;
      })
    );
  }

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/ordonnances', {
        medecinNom,
        patientNom,
        patientTelephone: patientTelephone || undefined,
        clientId: clientId || undefined,
        dateEmission,
        items: items.map((it) => ({
          produitId: it.produitId || undefined,
          medicamentNom: it.medicamentNom,
          dosage: it.dosage || undefined,
          posologie: it.posologie || undefined,
          dureeJours: it.dureeJours ? Number(it.dureeJours) : undefined,
          quantitePrescrite: Number(it.quantitePrescrite),
          instructions: it.instructions || undefined,
        })),
      });
      setModalCreation(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer l'ordonnance"));
    } finally {
      setEnregistrement(false);
    }
  }

  function ouvrirDetail(o: Ordonnance) {
    setDetail(o);
    setFichier(null);
    setError('');
  }

  async function annuler() {
    if (!detail) return;
    try {
      await api.post(`/ordonnances/${detail.id}/annuler`);
      setDetail(null);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'annuler l'ordonnance"));
    }
  }

  async function envoyerPieceJointe() {
    if (!detail || !fichier) return;
    setEnregistrement(true);
    setError('');
    try {
      const form = new FormData();
      form.append('fichier', fichier);
      const { data } = await api.post(`/ordonnances/${detail.id}/piece-jointe`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDetail(data.data);
      setFichier(null);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'envoyer la pièce jointe"));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar search={recherche} onSearch={setRecherche} searchPlaceholder="N° ou nom du patient..." actionLabel="Nouvelle ordonnance" onAction={ouvrirCreation} />

      {error && !detail && !modalCreation && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card overflow-hidden">
        {!chargement && filtres.length === 0 ? (
          <EmptyState icon={FileText} title="Aucune ordonnance" hint="Enregistrez une prescription à servir immédiatement ou plus tard" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Patient</th>
                  <th>Médecin</th>
                  <th>Lignes</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((o) => (
                  <tr key={o.id} className="cursor-pointer" onClick={() => ouvrirDetail(o)}>
                    <td className="font-medium" style={{ color: 'var(--color-ink)' }}>{o.numero}</td>
                    <td>{o.patientNom}</td>
                    <td>{o.medecinNom}</td>
                    <td>{o.items.length}</td>
                    <td><Badge tone={STATUT_TONE[o.statut]}>{STATUT_LABEL[o.statut]}</Badge></td>
                    <td>{new Date(o.dateEmission).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalCreation} onClose={() => setModalCreation(false)} title="Nouvelle ordonnance" maxWidth={680}>
        <form onSubmit={creer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Nom du médecin</label>
              <input className="input" required value={medecinNom} onChange={(e) => setMedecinNom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Date d&apos;émission</label>
              <input type="date" className="input" required value={dateEmission} onChange={(e) => setDateEmission(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Nom du patient</label>
              <input className="input" required value={patientNom} onChange={(e) => setPatientNom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Téléphone patient (optionnel)</label>
              <input className="input" value={patientTelephone} onChange={(e) => setPatientTelephone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Client associé (optionnel)</label>
            <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Aucun</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Médicaments prescrits</label>
            {items.map((it, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--color-surface-2)' }}>
                <div className="flex gap-2 items-center">
                  <select className="input flex-1" value={it.produitId} onChange={(e) => majItem(i, { produitId: e.target.value })}>
                    <option value="">Hors catalogue (texte libre)...</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}{p.dosage ? ` — ${p.dosage}` : ''}</option>
                    ))}
                  </select>
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems((prev) => prev.filter((_, ii) => ii !== i))} style={{ color: 'var(--color-danger)' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input className="input" placeholder="Nom du médicament" required value={it.medicamentNom} onChange={(e) => majItem(i, { medicamentNom: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <input className="input" placeholder="Posologie" value={it.posologie} onChange={(e) => majItem(i, { posologie: e.target.value })} />
                  <input type="number" min={1} className="input" placeholder="Durée (j)" value={it.dureeJours} onChange={(e) => majItem(i, { dureeJours: e.target.value })} />
                  <input type="number" min={1} className="input" placeholder="Qté prescrite" required value={it.quantitePrescrite} onChange={(e) => majItem(i, { quantitePrescrite: e.target.value })} />
                </div>
                <input className="input" placeholder="Instructions (optionnel)" value={it.instructions} onChange={(e) => majItem(i, { instructions: e.target.value })} />
              </div>
            ))}
            <button type="button" onClick={() => setItems((prev) => [...prev, itemVide()])} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
              <Plus className="w-3.5 h-3.5" /> Ajouter un médicament
            </button>
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalCreation(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : "Enregistrer l'ordonnance"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Ordonnance ${detail.numero}` : ''} maxWidth={640}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{detail.patientNom}</p>
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Dr {detail.medecinNom} · {new Date(detail.dateEmission).toLocaleDateString('fr-FR')}</p>
              </div>
              <Badge tone={STATUT_TONE[detail.statut]}>{STATUT_LABEL[detail.statut]}</Badge>
            </div>

            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Médicament</th>
                  <th>Posologie</th>
                  <th>Prescrit</th>
                  <th>Servi</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.medicamentNom}</td>
                    <td>{it.posologie || '—'}</td>
                    <td>{it.quantitePrescrite}</td>
                    <td>{it.quantiteServie}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {detail.pieceJointeUrl ? (
              <a
                href={`${(api.defaults.baseURL || '').replace(/\/api$/, '')}${detail.pieceJointeUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: 'var(--color-primary-2)' }}
              >
                <Paperclip className="w-4 h-4" /> Voir la pièce jointe
              </a>
            ) : (
              detail.statut !== 'ANNULEE' && (
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => setFichier(e.target.files?.[0] || null)} className="text-sm" />
                  <button type="button" disabled={!fichier || enregistrement} className="btn btn-secondary" onClick={envoyerPieceJointe}>
                    <Paperclip className="w-4 h-4" /> Joindre
                  </button>
                </div>
              )
            )}

            {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

            {detail.statut === 'ENREGISTREE' && (
              <div className="flex justify-end pt-2">
                <button className="btn btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={annuler}>
                  <Ban className="w-4 h-4" /> Annuler l&apos;ordonnance
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
