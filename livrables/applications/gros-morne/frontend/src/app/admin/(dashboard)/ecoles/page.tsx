'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, GraduationCap, X, Upload } from 'lucide-react';
import { ecolesApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const TYPES = ['LYCEE', 'COLLEGE', 'UNIVERSITE', 'CENTRE_FORMATION', 'BIBLIOTHEQUE', 'AUTRE'] as const;
const TYPE_LABELS: Record<string, string> = {
  LYCEE: 'Lycée', COLLEGE: 'Collège', UNIVERSITE: 'Université', CENTRE_FORMATION: 'Centre de formation',
  BIBLIOTHEQUE: 'Bibliothèque', AUTRE: 'Autre',
};
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Media { id: string; url: string; nomOriginal: string; type: string }
interface Traduction { id: string; locale: 'FR' | 'HT'; description: string }
interface School {
  id: string; nom: string; type: string; directeur: string | null; adresse: string | null;
  telephone: string | null; email: string | null; nombreEleves: number | null;
  statutPublication: string; ordre: number; photo: Media | null; traductions: Traduction[];
}

function traduction(s: School, locale: 'FR' | 'HT') {
  return s.traductions.find((t) => t.locale === locale);
}

export default function EcolesPage() {
  const [items, setItems] = useState<School[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nom, setNom] = useState('');
  const [type, setType] = useState<string>('LYCEE');
  const [directeur, setDirecteur] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [nombreEleves, setNombreEleves] = useState('');
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionHt, setDescriptionHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: itemsData }, { data: mediasData }] = await Promise.all([ecolesApi.listAdmin(), mediaApi.list()]);
      setItems(itemsData.data.ecoles);
      setMedias(mediasData.data.medias.filter((m: Media) => m.type === 'IMAGE'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setNom(''); setType('LYCEE'); setDirecteur(''); setAdresse(''); setTelephone(''); setEmail('');
    setNombreEleves(''); setStatutPublication('BROUILLON'); setOrdre(items.length); setPhotoId(null);
    setDescriptionFr(''); setDescriptionHt(''); setErreur(null); setModalOpen(true);
  }

  function ouvrirEdition(s: School) {
    setEditing(s);
    setNom(s.nom); setType(s.type); setDirecteur(s.directeur ?? ''); setAdresse(s.adresse ?? '');
    setTelephone(s.telephone ?? ''); setEmail(s.email ?? '');
    setNombreEleves(s.nombreEleves != null ? String(s.nombreEleves) : '');
    setStatutPublication(s.statutPublication); setOrdre(s.ordre); setPhotoId(s.photo?.id ?? null);
    setDescriptionFr(traduction(s, 'FR')?.description ?? ''); setDescriptionHt(traduction(s, 'HT')?.description ?? '');
    setErreur(null); setModalOpen(true);
  }

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

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !descriptionFr.trim()) {
      setErreur('Nom et description en français sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', description: descriptionFr },
        ...(descriptionHt.trim() ? [{ locale: 'HT', description: descriptionHt }] : []),
      ];
      const payload = {
        nom, type, directeur: directeur || undefined, adresse: adresse || undefined,
        telephone: telephone || undefined, email: email || undefined,
        nombreEleves: nombreEleves ? Number(nombreEleves) : undefined,
        statutPublication, photoId: photoId || undefined, ordre, traductions,
      };
      if (editing) await ecolesApi.update(editing.id, payload);
      else await ecolesApi.create(payload);
      setModalOpen(false);
      await charger();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      setErreur(message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimer(s: School) {
    if (!confirm(`Supprimer "${s.nom}" ?`)) return;
    await ecolesApi.remove(s.id);
    await charger();
  }

  const mediaSelectionne = medias.find((m) => m.id === photoId);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Éducation</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>Les établissements affichés sur la page Éducation.</p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5"><PageToolbar actionLabel="Nouvel établissement" onAction={ouvrirCreation} /></div>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : items.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Aucun établissement" hint="Créez la première fiche" />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'établissement" : 'Nouvel établissement'} maxWidth={760}>
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
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Directeur</label><input className="input" value={directeur} onChange={(e) => setDirecteur(e.target.value)} /></div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nombre d&apos;élèves</label><input type="number" className="input" value={nombreEleves} onChange={(e) => setNombreEleves(e.target.value)} /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Adresse</label><input className="input" value={adresse} onChange={(e) => setAdresse(e.target.value)} /></div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label><input className="input" value={telephone} onChange={(e) => setTelephone(e.target.value)} /></div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Statut</label>
              <select className="input" value={statutPublication} onChange={(e) => setStatutPublication(e.target.value)}>
                {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label><input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} /></div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Photo</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mediaSelectionne && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(mediaSelectionne.url)} alt={mediaSelectionne.nomOriginal} className="w-16 h-16 object-cover rounded-lg" />
                  <button onClick={() => setPhotoId(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-danger)', color: 'white' }}><X className="w-3 h-3" /></button>
                </div>
              )}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-line)' }}>
                <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploaderPhoto(f); e.target.value = ''; }} />
              </label>
            </div>
            {medias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medias.filter((m) => m.id !== photoId).slice(0, 12).map((m) => (
                  <button key={m.id} onClick={() => setPhotoId(m.id)}>
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
            <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement || !nom}>{editing ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
