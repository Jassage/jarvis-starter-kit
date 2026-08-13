'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Landmark } from 'lucide-react';
import { servicesMunicipauxApi } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const TYPES = ['MAIRIE', 'PROTECTION_CIVILE', 'POLICE', 'SANTE', 'EAU', 'ELECTRICITE', 'JUSTICE', 'AUTRE'] as const;
const TYPE_LABELS: Record<string, string> = {
  MAIRIE: 'Mairie', PROTECTION_CIVILE: 'Protection civile', POLICE: 'Police', SANTE: 'Santé',
  EAU: 'Eau', ELECTRICITE: 'Électricité', JUSTICE: 'Justice', AUTRE: 'Autre',
};
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Traduction { id: string; locale: 'FR' | 'HT'; presentation: string }
interface MunicipalService {
  id: string; nom: string; type: string; responsable: string | null; adresse: string | null;
  telephone: string | null; horaires: string | null; statutPublication: string; ordre: number;
  traductions: Traduction[];
}

function traduction(s: MunicipalService, locale: 'FR' | 'HT') {
  return s.traductions.find((t) => t.locale === locale);
}

export default function ServicesMunicipauxPage() {
  const [items, setItems] = useState<MunicipalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MunicipalService | null>(null);

  const [nom, setNom] = useState('');
  const [type, setType] = useState<string>('MAIRIE');
  const [responsable, setResponsable] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [horaires, setHoraires] = useState('');
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [presentationFr, setPresentationFr] = useState('');
  const [presentationHt, setPresentationHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await servicesMunicipauxApi.listAdmin();
      setItems(data.data.services);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setNom(''); setType('MAIRIE'); setResponsable(''); setAdresse(''); setTelephone(''); setHoraires('');
    setStatutPublication('BROUILLON'); setOrdre(items.length);
    setPresentationFr(''); setPresentationHt(''); setErreur(null); setModalOpen(true);
  }

  function ouvrirEdition(s: MunicipalService) {
    setEditing(s);
    setNom(s.nom); setType(s.type); setResponsable(s.responsable ?? ''); setAdresse(s.adresse ?? '');
    setTelephone(s.telephone ?? ''); setHoraires(s.horaires ?? ''); setStatutPublication(s.statutPublication);
    setOrdre(s.ordre);
    setPresentationFr(traduction(s, 'FR')?.presentation ?? ''); setPresentationHt(traduction(s, 'HT')?.presentation ?? '');
    setErreur(null); setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !presentationFr.trim()) {
      setErreur('Nom et présentation en français sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', presentation: presentationFr },
        ...(presentationHt.trim() ? [{ locale: 'HT', presentation: presentationHt }] : []),
      ];
      const payload = {
        nom, type, responsable: responsable || undefined, adresse: adresse || undefined,
        telephone: telephone || undefined, horaires: horaires || undefined,
        statutPublication, ordre, traductions,
      };
      if (editing) await servicesMunicipauxApi.update(editing.id, payload);
      else await servicesMunicipauxApi.create(payload);
      setModalOpen(false);
      await charger();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      setErreur(message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimer(s: MunicipalService) {
    if (!confirm(`Supprimer "${s.nom}" ?`)) return;
    await servicesMunicipauxApi.remove(s.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Services municipaux</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>Les services affichés sur la page Services municipaux.</p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5"><PageToolbar actionLabel="Nouveau service" onAction={ouvrirCreation} /></div>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : items.length === 0 ? (
          <EmptyState icon={Landmark} title="Aucun service" hint="Créez le premier service" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead><tr><th>Nom</th><th>Type</th><th>Statut</th><th>Français</th><th>Kreyòl</th><th></th></tr></thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.nom}</td>
                    <td>{TYPE_LABELS[s.type]}</td>
                    <td><Badge tone={STATUT_TONE[s.statutPublication]}>{STATUT_LABELS[s.statutPublication]}</Badge></td>
                    <td>{traduction(s, 'FR') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>{traduction(s, 'HT') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(s)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => supprimer(s)} className="btn" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le service' : 'Nouveau service'} maxWidth={720}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label><input className="input" value={nom} onChange={(e) => setNom(e.target.value)} /></div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Responsable</label><input className="input" value={responsable} onChange={(e) => setResponsable(e.target.value)} /></div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Horaires</label><input className="input" value={horaires} onChange={(e) => setHoraires(e.target.value)} /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Adresse</label><input className="input" value={adresse} onChange={(e) => setAdresse(e.target.value)} /></div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label><input className="input" value={telephone} onChange={(e) => setTelephone(e.target.value)} /></div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label><input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} /></div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Statut</label>
            <select className="input" value={statutPublication} onChange={(e) => setStatutPublication(e.target.value)}>
              {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <textarea className="input" rows={4} placeholder="Présentation" value={presentationFr} onChange={(e) => setPresentationFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input" rows={4} placeholder="Prezantasyon" value={presentationHt} onChange={(e) => setPresentationHt(e.target.value)} />
            </div>
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement || !nom}>{editing ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
