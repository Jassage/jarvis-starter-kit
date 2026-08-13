'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, CalendarDays, Upload, X } from 'lucide-react';
import { agendaApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const CATEGORIES = ['FESTIVAL', 'CARNAVAL', 'REUNION', 'MATCH', 'FORMATION', 'CONFERENCE', 'CULTUREL', 'SPORT', 'ECONOMIE', 'FETE', 'AUTRE'] as const;

const CATEGORIE_LABELS: Record<string, string> = {
  FESTIVAL: 'Festival', CARNAVAL: 'Carnaval', REUNION: 'Réunion', MATCH: 'Match', FORMATION: 'Formation',
  CONFERENCE: 'Conférence', CULTUREL: 'Culturel', SPORT: 'Sport', ECONOMIE: 'Économie', FETE: 'Fête', AUTRE: 'Autre',
};

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Traduction { id: string; locale: 'FR' | 'HT'; description: string }
interface Media { id: string; url: string; nomOriginal: string; type: string }
interface Evenement {
  id: string; nom: string; categorie: string; date: string; heureAffichage: string | null;
  lieu: string; organisateur: string | null; latitude: number | null; longitude: number | null;
  statutPublication: string; ordre: number; imagePrincipale: Media | null; traductions: Traduction[];
}

function traduction(e: Evenement, locale: 'FR' | 'HT') {
  return e.traductions.find((t) => t.locale === locale);
}
function toDateInput(iso: string) { return iso.slice(0, 10); }

export default function AgendaPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Evenement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePrincipaleId, setImagePrincipaleId] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState<string>('FETE');
  const [date, setDate] = useState('');
  const [heureAffichage, setHeureAffichage] = useState('');
  const [lieu, setLieu] = useState('');
  const [organisateur, setOrganisateur] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionHt, setDescriptionHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: mediasData }] = await Promise.all([agendaApi.listAdmin(), mediaApi.list()]);
      setEvenements(data.data.evenements);
      setMedias(mediasData.data.medias.filter((m: Media) => m.type === 'IMAGE'));
    } finally {
      setLoading(false);
    }
  }, []);

  async function uploaderPhoto(fichier: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      setMedias((m) => [data.data.media, ...m]);
      setImagePrincipaleId(data.data.media.id);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => { charger(); }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setNom('');
    setCategorie('FETE');
    setDate('');
    setHeureAffichage('');
    setLieu('');
    setOrganisateur('');
    setLatitude('');
    setLongitude('');
    setStatutPublication('BROUILLON');
    setOrdre(0);
    setDescriptionFr('');
    setDescriptionHt('');
    setImagePrincipaleId(null);
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(e: Evenement) {
    setEditing(e);
    setNom(e.nom);
    setCategorie(e.categorie);
    setDate(toDateInput(e.date));
    setHeureAffichage(e.heureAffichage ?? '');
    setLieu(e.lieu);
    setOrganisateur(e.organisateur ?? '');
    setLatitude(e.latitude != null ? String(e.latitude) : '');
    setLongitude(e.longitude != null ? String(e.longitude) : '');
    setStatutPublication(e.statutPublication);
    setOrdre(e.ordre);
    setDescriptionFr(traduction(e, 'FR')?.description ?? '');
    setDescriptionHt(traduction(e, 'HT')?.description ?? '');
    setImagePrincipaleId(e.imagePrincipale?.id ?? null);
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !lieu.trim() || !date || !descriptionFr.trim()) {
      setErreur('Nom, lieu, date et description en français sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', description: descriptionFr },
        ...(descriptionHt.trim() ? [{ locale: 'HT', description: descriptionHt }] : []),
      ];
      const payload = {
        nom,
        categorie,
        date,
        heureAffichage: heureAffichage || undefined,
        lieu,
        organisateur: organisateur || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        statutPublication,
        ordre,
        imagePrincipaleId: imagePrincipaleId || undefined,
        traductions,
      };
      if (editing) {
        await agendaApi.update(editing.id, payload);
      } else {
        await agendaApi.create(payload);
      }
      setModalOpen(false);
      await charger();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Une erreur est survenue.';
      setErreur(message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimer(e: Evenement) {
    if (!confirm(`Supprimer "${e.nom}" ?`)) return;
    await agendaApi.remove(e.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Agenda</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Les événements affichés sur la page Agenda (seuls les événements publiés à venir sont visibles publiquement).
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouvel événement" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : evenements.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Aucun événement" hint="Créez le premier événement" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Statut</th>
                  <th>Kreyòl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {evenements.map((e) => (
                  <tr key={e.id}>
                    <td className="font-semibold">{e.nom}</td>
                    <td>{CATEGORIE_LABELS[e.categorie]}</td>
                    <td>{toDateInput(e.date)}</td>
                    <td>{e.lieu}</td>
                    <td><Badge tone={STATUT_TONE[e.statutPublication]}>{STATUT_LABELS[e.statutPublication]}</Badge></td>
                    <td>{traduction(e, 'HT') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(e)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimer(e)}
                          className="btn"
                          style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'événement" : 'Nouvel événement'} maxWidth={720}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Fête Patronale de Gros-Morne" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
              <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Date</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Heure (affichage libre)</label>
              <input className="input" value={heureAffichage} onChange={(e) => setHeureAffichage(e.target.value)} placeholder="ex: 10:00 AM ou Toute la journée" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Statut</label>
              <select className="input" value={statutPublication} onChange={(e) => setStatutPublication(e.target.value)}>
                {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Lieu</label>
              <input className="input" value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="ex: Stade Municipal" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Organisateur</label>
              <input className="input" value={organisateur} onChange={(e) => setOrganisateur(e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Latitude</label>
              <input className="input" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="19.6667" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Longitude</label>
              <input className="input" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-72.6833" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
              <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Photo</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {imagePrincipaleId && medias.find((m) => m.id === imagePrincipaleId) && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(medias.find((m) => m.id === imagePrincipaleId)!.url)} alt={nom} className="w-16 h-16 object-cover rounded-lg" />
                  <button onClick={() => setImagePrincipaleId(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-danger)', color: 'white' }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-line)' }}>
                <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploaderPhoto(f); e.target.value = ''; }} />
              </label>
            </div>
            {medias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medias.filter((m) => m.id !== imagePrincipaleId).slice(0, 12).map((m) => (
                  <button key={m.id} onClick={() => setImagePrincipaleId(m.id)} title="Utiliser cette photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(m.url)} alt={m.nomOriginal} className="w-12 h-12 object-cover rounded-lg opacity-50 hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <textarea className="input" rows={4} placeholder="Description" value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input" rows={4} placeholder="Deskripsyon" value={descriptionHt} onChange={(e) => setDescriptionHt(e.target.value)} />
            </div>
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement || !nom}>
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
