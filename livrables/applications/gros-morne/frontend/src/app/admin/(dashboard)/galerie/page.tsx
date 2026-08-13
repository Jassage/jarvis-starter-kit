'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Images, X, Plus, Upload } from 'lucide-react';
import { galerieApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const CATEGORIES = ['NATURE', 'CULTURE', 'HISTOIRE', 'EVENEMENTS', 'TOURISME', 'DRONE', 'VIE_LOCALE', 'ARCHITECTURE', 'AUTRE'] as const;
const CATEGORIE_LABELS: Record<string, string> = {
  NATURE: 'Nature', CULTURE: 'Culture', HISTOIRE: 'Histoire', EVENEMENTS: 'Événements',
  TOURISME: 'Tourisme', DRONE: 'Drone', VIE_LOCALE: 'Vie locale', ARCHITECTURE: 'Architecture', AUTRE: 'Autre',
};

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Media { id: string; url: string; nomOriginal: string; type: string }
interface Traduction { id: string; locale: 'FR' | 'HT'; description: string }
interface GalerieMediaItem {
  id?: string; mediaId?: string | null; icone?: string | null; titre: string; auteur?: string | null; lieu?: string | null; ordre: number;
  media?: Media | null;
}
interface Album {
  id: string; nom: string; categorie: string; statutPublication: string; ordre: number;
  photoCouvertureId?: string | null; photoCouverture: Media | null; traductions: Traduction[]; medias: GalerieMediaItem[];
}

function traduction(a: Album, locale: 'FR' | 'HT') {
  return a.traductions.find((t) => t.locale === locale);
}

export default function GaleriePage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState<string>('NATURE');
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionHt, setDescriptionHt] = useState('');
  const [items, setItems] = useState<GalerieMediaItem[]>([]);
  const [photoCouvertureId, setPhotoCouvertureId] = useState<string | null>(null);
  const [photoCouverture, setPhotoCouverture] = useState<Media | null>(null);
  const [uploadingCouverture, setUploadingCouverture] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: albumsData }, { data: mediasData }] = await Promise.all([
        galerieApi.listAdmin(),
        mediaApi.list(),
      ]);
      setAlbums(albumsData.data.albums);
      setMedias(mediasData.data.medias.filter((m: Media) => m.type === 'IMAGE'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setNom('');
    setCategorie('NATURE');
    setStatutPublication('BROUILLON');
    setOrdre(albums.length);
    setDescriptionFr('');
    setDescriptionHt('');
    setItems([]);
    setPhotoCouvertureId(null);
    setPhotoCouverture(null);
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(a: Album) {
    setEditing(a);
    setNom(a.nom);
    setCategorie(a.categorie);
    setStatutPublication(a.statutPublication);
    setOrdre(a.ordre);
    setDescriptionFr(traduction(a, 'FR')?.description ?? '');
    setDescriptionHt(traduction(a, 'HT')?.description ?? '');
    setItems(a.medias.map((m) => ({ ...m })));
    setPhotoCouvertureId(a.photoCouverture?.id ?? null);
    setPhotoCouverture(a.photoCouverture ?? null);
    setErreur(null);
    setModalOpen(true);
  }

  function ajouterItem() {
    setItems((prev) => [...prev, { titre: '', icone: '📷', ordre: prev.length }]);
  }

  function ajouterItemDepuisMedia(m: Media) {
    setItems((prev) => [...prev, { mediaId: m.id, media: m, icone: null, titre: m.nomOriginal, ordre: prev.length }]);
  }

  function retirerItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function majItem(index: number, champ: keyof GalerieMediaItem, valeur: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [champ]: valeur } : it)));
  }

  async function uploaderPhotoItem(index: number, fichier: File) {
    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      setMedias((m) => [data.data.media, ...m]);
      setItems((prev) => prev.map((it, i) => (i === index ? { ...it, mediaId: data.data.media.id, media: data.data.media, icone: null } : it)));
    } finally {
      setUploadingIndex(null);
    }
  }

  function retirerPhotoItem(index: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, mediaId: null, media: null } : it)));
  }

  async function uploaderCouverture(fichier: File) {
    setUploadingCouverture(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      setMedias((m) => [data.data.media, ...m]);
      setPhotoCouvertureId(data.data.media.id);
      setPhotoCouverture(data.data.media);
    } finally {
      setUploadingCouverture(false);
    }
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !descriptionFr.trim()) {
      setErreur('Nom et description en français sont requis.');
      return;
    }
    if (items.some((it) => !it.titre.trim())) {
      setErreur('Chaque photo doit avoir un titre.');
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
        statutPublication,
        ordre,
        photoCouvertureId: photoCouvertureId || undefined,
        traductions,
        medias: items.map((it, i) => ({
          mediaId: it.mediaId || undefined,
          icone: it.icone || undefined,
          titre: it.titre,
          auteur: it.auteur || undefined,
          lieu: it.lieu || undefined,
          ordre: i,
        })),
      };
      if (editing) {
        await galerieApi.update(editing.id, payload);
      } else {
        await galerieApi.create(payload);
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

  async function supprimer(a: Album) {
    if (!confirm(`Supprimer l'album "${a.nom}" ?`)) return;
    await galerieApi.remove(a.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Galerie</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Les albums photo affichés sur la page Galerie.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouvel album" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : albums.length === 0 ? (
          <EmptyState icon={Images} title="Aucun album" hint="Créez le premier album" />
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
                {albums.map((a) => (
                  <tr key={a.id}>
                    <td className="font-semibold">{a.nom}</td>
                    <td>{CATEGORIE_LABELS[a.categorie]}</td>
                    <td><Badge tone={STATUT_TONE[a.statutPublication]}>{STATUT_LABELS[a.statutPublication]}</Badge></td>
                    <td>{a.medias.length}</td>
                    <td>{traduction(a, 'FR') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>{traduction(a, 'HT') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(a)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimer(a)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'album" : 'Nouvel album'} maxWidth={820}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Nature" />
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <textarea className="input" rows={2} placeholder="Description de l'album" value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input" rows={2} placeholder="Deskripsyon albòm nan" value={descriptionHt} onChange={(e) => setDescriptionHt(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Photo de couverture</label>
            <div className="flex flex-wrap gap-2">
              {photoCouverture ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(photoCouverture.url)} alt={photoCouverture.nomOriginal} className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    onClick={() => { setPhotoCouvertureId(null); setPhotoCouverture(null); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-danger)', color: 'white' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-line)' }}>
                  <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingCouverture}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploaderCouverture(f); e.target.value = ''; }}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold" style={{ color: 'var(--color-ink-2)' }}>Photos de l&apos;album</label>
              <button onClick={ajouterItem} className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>
                <Plus className="w-3.5 h-3.5" /> Ajouter une photo (sans image, emoji de repère)
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((it, i) => (
                <div key={i} className="p-3 rounded-xl grid sm:grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center" style={{ background: 'var(--color-surface-2)' }}>
                  {it.mediaId && it.media ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl(it.media.url)} alt={it.titre} className="w-14 h-14 object-cover rounded-lg" />
                      <button
                        onClick={() => retirerPhotoItem(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--color-danger)', color: 'white' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer text-lg" style={{ borderColor: 'var(--color-line)' }}>
                      {it.icone || <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingIndex === i}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploaderPhotoItem(i, f); e.target.value = ''; }}
                      />
                    </label>
                  )}
                  <input className="input" value={it.titre} onChange={(e) => majItem(i, 'titre', e.target.value)} placeholder="Titre" />
                  <input className="input" value={it.auteur ?? ''} onChange={(e) => majItem(i, 'auteur', e.target.value)} placeholder="Auteur (optionnel)" />
                  <input className="input" value={it.lieu ?? ''} onChange={(e) => majItem(i, 'lieu', e.target.value)} placeholder="Lieu (optionnel)" />
                  <button
                    onClick={() => retirerItem(i)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
                  Aucune photo. Cliquez sur une case pour uploader une image, ou réutilisez-en une ci-dessous.
                </p>
              )}
            </div>
            {medias.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Réutiliser une photo déjà en bibliothèque</p>
                <div className="flex flex-wrap gap-2">
                  {medias.slice(0, 12).map((m) => (
                    <button key={m.id} onClick={() => ajouterItemDepuisMedia(m)} title="Ajouter cette photo à l'album">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl(m.url)} alt={m.nomOriginal} className="w-12 h-12 object-cover rounded-lg opacity-50 hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
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
