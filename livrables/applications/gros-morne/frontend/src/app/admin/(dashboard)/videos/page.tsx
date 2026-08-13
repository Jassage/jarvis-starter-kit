'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Video as VideoIcon } from 'lucide-react';
import { videosApi } from '@/lib/api';
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

interface Traduction { id: string; locale: 'FR' | 'HT'; description: string }
interface Video {
  id: string; titre: string; url: string; categorie: string; miseEnAvant: boolean;
  statutPublication: string; ordre: number; traductions: Traduction[];
}

function traduction(v: Video, locale: 'FR' | 'HT') {
  return v.traductions.find((t) => t.locale === locale);
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);

  const [titre, setTitre] = useState('');
  const [url, setUrl] = useState('');
  const [categorie, setCategorie] = useState<string>('CULTURE');
  const [miseEnAvant, setMiseEnAvant] = useState(false);
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionHt, setDescriptionHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videosApi.listAdmin();
      setVideos(data.data.videos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setTitre('');
    setUrl('');
    setCategorie('CULTURE');
    setMiseEnAvant(false);
    setStatutPublication('BROUILLON');
    setOrdre(videos.length);
    setDescriptionFr('');
    setDescriptionHt('');
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(v: Video) {
    setEditing(v);
    setTitre(v.titre);
    setUrl(v.url);
    setCategorie(v.categorie);
    setMiseEnAvant(v.miseEnAvant);
    setStatutPublication(v.statutPublication);
    setOrdre(v.ordre);
    setDescriptionFr(traduction(v, 'FR')?.description ?? '');
    setDescriptionHt(traduction(v, 'HT')?.description ?? '');
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!titre.trim() || !url.trim() || !descriptionFr.trim()) {
      setErreur('Titre, lien et description en français sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', description: descriptionFr },
        ...(descriptionHt.trim() ? [{ locale: 'HT', description: descriptionHt }] : []),
      ];
      const payload = { titre, url, categorie, miseEnAvant, statutPublication, ordre, traductions };
      if (editing) {
        await videosApi.update(editing.id, payload);
      } else {
        await videosApi.create(payload);
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

  async function supprimer(v: Video) {
    if (!confirm(`Supprimer la vidéo "${v.titre}" ?`)) return;
    await videosApi.remove(v.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Vidéos</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Les vidéos (liens YouTube/Vimeo) affichées en bas de la page Galerie.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouvelle vidéo" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : videos.length === 0 ? (
          <EmptyState icon={VideoIcon} title="Aucune vidéo" hint="Ajoutez la première vidéo" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Mise en avant</th>
                  <th>Statut</th>
                  <th>Kreyòl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id}>
                    <td className="font-semibold">{v.titre}</td>
                    <td>{CATEGORIE_LABELS[v.categorie]}</td>
                    <td>{v.miseEnAvant ? <Badge tone="brand">Oui</Badge> : '—'}</td>
                    <td><Badge tone={STATUT_TONE[v.statutPublication]}>{STATUT_LABELS[v.statutPublication]}</Badge></td>
                    <td>{traduction(v, 'HT') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(v)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimer(v)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la vidéo' : 'Nouvelle vidéo'} maxWidth={680}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Titre</label>
            <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Lien (YouTube, Vimeo...)</label>
            <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
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
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
              <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            <input type="checkbox" checked={miseEnAvant} onChange={(e) => setMiseEnAvant(e.target.checked)} />
            Mettre en avant
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <textarea className="input" rows={3} placeholder="Description" value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input" rows={3} placeholder="Deskripsyon" value={descriptionHt} onChange={(e) => setDescriptionHt(e.target.value)} />
            </div>
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement || !titre}>
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
