'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Quote, Upload, X } from 'lucide-react';
import { temoignagesApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Media { id: string; url: string; nomOriginal: string; type: string }
interface Traduction { id: string; locale: 'FR' | 'HT'; contenu: string }
interface Temoignage {
  id: string;
  nom: string;
  fonction: string | null;
  note: number | null;
  statutPublication: string;
  ordre: number;
  photo: Media | null;
  traductions: Traduction[];
}

function traduction(t: Temoignage, locale: 'FR' | 'HT') {
  return t.traductions.find((tr) => tr.locale === locale);
}

export default function TemoignagesPage() {
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Temoignage | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nom, setNom] = useState('');
  const [fonction, setFonction] = useState('');
  const [note, setNote] = useState('');
  const [photoId, setPhotoId] = useState('');
  const [statutPublication, setStatutPublication] = useState('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [contenuFr, setContenuFr] = useState('');
  const [contenuHt, setContenuHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: mediasData }] = await Promise.all([temoignagesApi.listAdmin(), mediaApi.list()]);
      setTemoignages(data.data.temoignages);
      setMedias(mediasData.data.medias.filter((m: Media) => m.type === 'IMAGE'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function uploaderPhoto(fichier: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      setMedias((m) => [data.data.media, ...m]);
      setPhotoId(data.data.media.id);
    } finally {
      setUploading(false);
    }
  }

  function ouvrirCreation() {
    setEditing(null);
    setNom('');
    setFonction('');
    setNote('');
    setPhotoId('');
    setStatutPublication('BROUILLON');
    setOrdre(temoignages.length);
    setContenuFr('');
    setContenuHt('');
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(t: Temoignage) {
    setEditing(t);
    setNom(t.nom);
    setFonction(t.fonction ?? '');
    setNote(t.note != null ? String(t.note) : '');
    setPhotoId(t.photo?.id ?? '');
    setStatutPublication(t.statutPublication);
    setOrdre(t.ordre);
    setContenuFr(traduction(t, 'FR')?.contenu ?? '');
    setContenuHt(traduction(t, 'HT')?.contenu ?? '');
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !contenuFr.trim()) {
      setErreur('Nom et témoignage en français requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', contenu: contenuFr },
        ...(contenuHt.trim() ? [{ locale: 'HT', contenu: contenuHt }] : []),
      ];
      const payload = {
        nom,
        fonction: fonction || undefined,
        note: note ? Number(note) : undefined,
        photoId: photoId || undefined,
        statutPublication,
        ordre,
        traductions,
      };
      if (editing) {
        await temoignagesApi.update(editing.id, payload);
      } else {
        await temoignagesApi.create(payload);
      }
      setModalOpen(false);
      await charger();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      setErreur(message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimer(t: Temoignage) {
    if (!confirm(`Supprimer le témoignage de "${t.nom}" ?`)) return;
    await temoignagesApi.remove(t.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Témoignages</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Témoignages affichés sur la page d&apos;accueil.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouveau témoignage" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : temoignages.length === 0 ? (
          <EmptyState icon={Quote} title="Aucun témoignage" hint="Créez le premier témoignage" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Fonction</th>
                  <th>Statut</th>
                  <th>Ordre</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {temoignages.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold">{t.nom}</td>
                    <td>{t.fonction ?? '—'}</td>
                    <td><Badge tone={STATUT_TONE[t.statutPublication]}>{STATUT_LABELS[t.statutPublication]}</Badge></td>
                    <td>{t.ordre}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(t)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => supprimer(t)} className="btn" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le témoignage' : 'Nouveau témoignage'} maxWidth={680}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Marie D." />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Fonction</label>
              <input className="input" value={fonction} onChange={(e) => setFonction(e.target.value)} placeholder="ex: Diaspora — Miami" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Note (1-5, optionnel)</label>
              <input type="number" min={1} max={5} className="input" value={note} onChange={(e) => setNote(e.target.value)} />
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

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Photo (optionnel)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photoId && medias.find((m) => m.id === photoId) && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(medias.find((m) => m.id === photoId)!.url)} alt={nom} className="w-16 h-16 object-cover rounded-full" />
                  <button onClick={() => setPhotoId('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-danger)', color: 'white' }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-line)' }}>
                <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploaderPhoto(f); e.target.value = ''; }} />
              </label>
            </div>
            {medias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medias.filter((m) => m.id !== photoId).slice(0, 12).map((m) => (
                  <button key={m.id} onClick={() => setPhotoId(m.id)} title="Utiliser cette photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(m.url)} alt={m.nomOriginal} className="w-12 h-12 object-cover rounded-full opacity-50 hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <textarea className="input" rows={4} placeholder="Témoignage" value={contenuFr} onChange={(e) => setContenuFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input" rows={4} placeholder="Temwayaj" value={contenuHt} onChange={(e) => setContenuHt(e.target.value)} />
            </div>
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement}>
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
