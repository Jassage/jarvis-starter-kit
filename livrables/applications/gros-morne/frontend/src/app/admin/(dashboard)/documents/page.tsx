'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, FileText, Upload, X } from 'lucide-react';
import { documentsApi, mediaApi } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Media { id: string; url: string; nomOriginal: string; type: string }
interface DocumentFichier {
  id: string;
  titre: string;
  description: string | null;
  statutPublication: string;
  ordre: number;
  media: Media;
}

export default function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<DocumentFichier[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentFichier | null>(null);
  const [uploading, setUploading] = useState(false);

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [statutPublication, setStatutPublication] = useState('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: mediasData }] = await Promise.all([documentsApi.listAdmin(), mediaApi.list()]);
      setDocuments(data.data.documents);
      setMedias(mediasData.data.medias);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function uploaderFichier(fichier: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      setMedias((m) => [data.data.media, ...m]);
      setMediaId(data.data.media.id);
    } finally {
      setUploading(false);
    }
  }

  function ouvrirCreation() {
    setEditing(null);
    setTitre('');
    setDescription('');
    setMediaId('');
    setStatutPublication('BROUILLON');
    setOrdre(documents.length);
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(d: DocumentFichier) {
    setEditing(d);
    setTitre(d.titre);
    setDescription(d.description ?? '');
    setMediaId(d.media.id);
    setStatutPublication(d.statutPublication);
    setOrdre(d.ordre);
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!titre.trim() || !mediaId) {
      setErreur('Titre et fichier requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const payload = { titre, description: description || undefined, mediaId, statutPublication, ordre };
      if (editing) {
        await documentsApi.update(editing.id, payload);
      } else {
        await documentsApi.create(payload);
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

  async function supprimer(d: DocumentFichier) {
    if (!confirm(`Supprimer le document "${d.titre}" ?`)) return;
    await documentsApi.remove(d.id);
    await charger();
  }

  const mediaSelectionne = medias.find((m) => m.id === mediaId);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Documents</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Formulaires, comptes-rendus et documents officiels affichés sur la page publique /documents.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouveau document" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : documents.length === 0 ? (
          <EmptyState icon={FileText} title="Aucun document" hint="Ajoutez le premier document" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Fichier</th>
                  <th>Statut</th>
                  <th>Ordre</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td className="font-semibold">{d.titre}</td>
                    <td className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{d.media.nomOriginal}</td>
                    <td><Badge tone={STATUT_TONE[d.statutPublication]}>{STATUT_LABELS[d.statutPublication]}</Badge></td>
                    <td>{d.ordre}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(d)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => supprimer(d)} className="btn" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le document' : 'Nouveau document'} maxWidth={600}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Titre</label>
            <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="ex: Formulaire de demande de permis" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Description (optionnel)</label>
            <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
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
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Fichier (PDF ou image, 10 Mo max)</label>
            {mediaSelectionne && (
              <div className="flex items-center gap-2 mb-2 rounded-lg p-2" style={{ background: 'var(--color-surface-2)' }}>
                <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-2)' }} />
                <span className="text-xs font-semibold truncate flex-1">{mediaSelectionne.nomOriginal}</span>
                <button onClick={() => setMediaId('')} style={{ color: 'var(--color-danger)' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <label className="btn btn-secondary inline-flex" style={{ cursor: 'pointer' }}>
              <Upload className="w-3.5 h-3.5" /> {uploading ? 'Téléversement...' : 'Téléverser un fichier'}
              <input type="file" accept="application/pdf,image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploaderFichier(f); e.target.value = ''; }} />
            </label>
            {medias.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--color-ink-3)' }}>Ou réutiliser un fichier déjà téléversé :</p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {medias.filter((m) => m.id !== mediaId).map((m) => (
                    <button key={m.id} onClick={() => setMediaId(m.id)} className="text-left text-xs px-2 py-1.5 rounded-lg hover:bg-gray-50 truncate" style={{ color: 'var(--color-ink-2)' }}>
                      {m.nomOriginal}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
