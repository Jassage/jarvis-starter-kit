'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Compass, X, Upload } from 'lucide-react';
import { tourismeApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const CATEGORIES = [
  'NATURE', 'CASCADE', 'RIVIERE', 'MONTAGNE', 'GROTTE', 'EGLISE',
  'SITE_HISTORIQUE', 'SENTIER', 'HEBERGEMENT', 'RESTAURANT', 'CULTURE', 'EVENEMENT', 'AUTRE',
] as const;

const CATEGORIE_LABELS: Record<string, string> = {
  NATURE: 'Nature', CASCADE: 'Cascade', RIVIERE: 'Rivière', MONTAGNE: 'Montagne', GROTTE: 'Grotte',
  EGLISE: 'Église', SITE_HISTORIQUE: 'Site historique', SENTIER: 'Sentier', HEBERGEMENT: 'Hébergement',
  RESTAURANT: 'Restaurant', CULTURE: 'Culture', EVENEMENT: 'Événement', AUTRE: 'Autre',
};

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = {
  BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning',
};

interface Media {
  id: string;
  url: string;
  nomOriginal: string;
  type: string;
}

interface Traduction {
  id: string;
  locale: 'FR' | 'HT';
  description: string;
  conseils: string | null;
}

interface Photo {
  id: string;
  ordre: number;
  media: Media;
}

interface TourismPlace {
  id: string;
  nom: string;
  categorie: string;
  duree: string | null;
  difficulte: string | null;
  tags: string[];
  latitude: number | null;
  longitude: number | null;
  horaires: string | null;
  tarif: string | null;
  telephone: string | null;
  servicesDisponibles: string[];
  statutPublication: string;
  ordre: number;
  traductions: Traduction[];
  photos: Photo[];
}

function traduction(lieu: TourismPlace, locale: 'FR' | 'HT') {
  return lieu.traductions.find((t) => t.locale === locale);
}

function joinList(v: string[]) {
  return v.join(', ');
}

function splitList(v: string) {
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

export default function TourismePage() {
  const [lieux, setLieux] = useState<TourismPlace[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TourismPlace | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState<string>('NATURE');
  const [duree, setDuree] = useState('');
  const [difficulte, setDifficulte] = useState('');
  const [tags, setTags] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [horaires, setHoraires] = useState('');
  const [tarif, setTarif] = useState('');
  const [telephone, setTelephone] = useState('');
  const [servicesDisponibles, setServicesDisponibles] = useState('');
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [descriptionFr, setDescriptionFr] = useState('');
  const [conseilsFr, setConseilsFr] = useState('');
  const [descriptionHt, setDescriptionHt] = useState('');
  const [conseilsHt, setConseilsHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: lieuxData }, { data: mediasData }] = await Promise.all([
        tourismeApi.listAdmin(),
        mediaApi.list(),
      ]);
      setLieux(lieuxData.data.lieux);
      setMedias(mediasData.data.medias.filter((m: Media) => m.type === 'IMAGE'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setNom('');
    setCategorie('NATURE');
    setDuree('');
    setDifficulte('');
    setTags('');
    setLatitude('');
    setLongitude('');
    setHoraires('');
    setTarif('');
    setTelephone('');
    setServicesDisponibles('');
    setStatutPublication('BROUILLON');
    setOrdre(lieux.length);
    setMediaIds([]);
    setDescriptionFr('');
    setConseilsFr('');
    setDescriptionHt('');
    setConseilsHt('');
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(lieu: TourismPlace) {
    setEditing(lieu);
    setNom(lieu.nom);
    setCategorie(lieu.categorie);
    setDuree(lieu.duree ?? '');
    setDifficulte(lieu.difficulte ?? '');
    setTags(joinList(lieu.tags));
    setLatitude(lieu.latitude != null ? String(lieu.latitude) : '');
    setLongitude(lieu.longitude != null ? String(lieu.longitude) : '');
    setHoraires(lieu.horaires ?? '');
    setTarif(lieu.tarif ?? '');
    setTelephone(lieu.telephone ?? '');
    setServicesDisponibles(joinList(lieu.servicesDisponibles));
    setStatutPublication(lieu.statutPublication);
    setOrdre(lieu.ordre);
    setMediaIds(lieu.photos.sort((a, b) => a.ordre - b.ordre).map((p) => p.media.id));
    setDescriptionFr(traduction(lieu, 'FR')?.description ?? '');
    setConseilsFr(traduction(lieu, 'FR')?.conseils ?? '');
    setDescriptionHt(traduction(lieu, 'HT')?.description ?? '');
    setConseilsHt(traduction(lieu, 'HT')?.conseils ?? '');
    setErreur(null);
    setModalOpen(true);
  }

  async function uploaderPhoto(fichier: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      setMedias((m) => [data.data.media, ...m]);
      setMediaIds((ids) => [...ids, data.data.media.id]);
    } finally {
      setUploading(false);
    }
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !descriptionFr.trim()) {
      setErreur('Nom et description en français sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', description: descriptionFr, conseils: conseilsFr || undefined },
        ...(descriptionHt.trim() ? [{ locale: 'HT', description: descriptionHt, conseils: conseilsHt || undefined }] : []),
      ];
      const payload = {
        nom,
        categorie,
        duree: duree || undefined,
        difficulte: difficulte || undefined,
        tags: splitList(tags),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        horaires: horaires || undefined,
        tarif: tarif || undefined,
        telephone: telephone || undefined,
        servicesDisponibles: splitList(servicesDisponibles),
        statutPublication,
        ordre,
        mediaIds,
        traductions,
      };
      if (editing) {
        await tourismeApi.update(editing.id, payload);
      } else {
        await tourismeApi.create(payload);
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

  async function supprimer(lieu: TourismPlace) {
    if (!confirm(`Supprimer "${lieu.nom}" ?`)) return;
    await tourismeApi.remove(lieu.id);
    await charger();
  }

  const mediasSelectionnes = mediaIds
    .map((id) => medias.find((m) => m.id === id))
    .filter((m): m is Media => !!m);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Tourisme</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Les lieux touristiques affichés sur la page Tourisme.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouveau lieu" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : lieux.length === 0 ? (
          <EmptyState icon={Compass} title="Aucun lieu touristique" hint="Créez la première fiche" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>Photos</th>
                  <th>Français</th>
                  <th>Kreyòl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lieux.map((lieu) => (
                  <tr key={lieu.id}>
                    <td className="font-semibold">{lieu.nom}</td>
                    <td>{CATEGORIE_LABELS[lieu.categorie]}</td>
                    <td><Badge tone={STATUT_TONE[lieu.statutPublication]}>{STATUT_LABELS[lieu.statutPublication]}</Badge></td>
                    <td>{lieu.photos.length}</td>
                    <td>{traduction(lieu, 'FR') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>{traduction(lieu, 'HT') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(lieu)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimer(lieu)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le lieu' : 'Nouveau lieu'} maxWidth={760}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Les Mornes Panoramiques" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
              <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Statut</label>
              <select className="input" value={statutPublication} onChange={(e) => setStatutPublication(e.target.value)}>
                {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Durée de visite</label>
              <input className="input" value={duree} onChange={(e) => setDuree(e.target.value)} placeholder="ex: 2-4 heures" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Difficulté</label>
              <input className="input" value={difficulte} onChange={(e) => setDifficulte(e.target.value)} placeholder="ex: Modérée" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
              <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Tags (séparés par des virgules)</label>
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Randonnée, Vue panoramique, Nature" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Latitude</label>
              <input className="input" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="19.6667" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Longitude</label>
              <input className="input" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-72.6833" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Horaires</label>
              <input className="input" value={horaires} onChange={(e) => setHoraires(e.target.value)} placeholder="ex: 8h-17h tous les jours" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Tarif</label>
              <input className="input" value={tarif} onChange={(e) => setTarif(e.target.value)} placeholder="ex: Gratuit / 100 HTG" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label>
              <input className="input" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Services disponibles (séparés par des virgules)</label>
            <input className="input" value={servicesDisponibles} onChange={(e) => setServicesDisponibles(e.target.value)} placeholder="Parking, Guide local, Toilettes" />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Photos</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mediasSelectionnes.map((m) => (
                <div key={m.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(m.url)} alt={m.nomOriginal} className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    onClick={() => setMediaIds((ids) => ids.filter((id) => id !== m.id))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-danger)', color: 'white' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-line)' }}>
                <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const fichier = e.target.files?.[0];
                    if (fichier) uploaderPhoto(fichier);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {medias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medias.filter((m) => !mediaIds.includes(m.id)).slice(0, 12).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMediaIds((ids) => [...ids, m.id])}
                    className="relative"
                    title="Ajouter cette photo"
                  >
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
              <textarea className="input mb-2" rows={4} placeholder="Description" value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} />
              <textarea className="input" rows={2} placeholder="Conseils (optionnel)" value={conseilsFr} onChange={(e) => setConseilsFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input mb-2" rows={4} placeholder="Deskripsyon" value={descriptionHt} onChange={(e) => setDescriptionHt(e.target.value)} />
              <textarea className="input" rows={2} placeholder="Konsèy (opsyonèl)" value={conseilsHt} onChange={(e) => setConseilsHt(e.target.value)} />
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
