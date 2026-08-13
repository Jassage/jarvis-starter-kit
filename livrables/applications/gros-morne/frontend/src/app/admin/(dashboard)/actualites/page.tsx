'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Newspaper, X, Upload } from 'lucide-react';
import { actualitesApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const CATEGORIES = [
  'COMMUNIQUE', 'INTERVIEW', 'REPORTAGE', 'CULTURE', 'SPORT', 'SANTE',
  'AGRICULTURE', 'EDUCATION', 'POLITIQUE', 'DEVELOPPEMENT', 'INFRASTRUCTURE', 'AUTRE',
] as const;

const CATEGORIE_LABELS: Record<string, string> = {
  COMMUNIQUE: 'Communiqué', INTERVIEW: 'Interview', REPORTAGE: 'Reportage', CULTURE: 'Culture',
  SPORT: 'Sport', SANTE: 'Santé', AGRICULTURE: 'Agriculture', EDUCATION: 'Éducation',
  POLITIQUE: 'Politique locale', DEVELOPPEMENT: 'Développement', INFRASTRUCTURE: 'Infrastructure', AUTRE: 'Autre',
};

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Media { id: string; url: string; nomOriginal: string; type: string }
interface Traduction { id: string; locale: 'FR' | 'HT'; resume: string; contenu: string | null }
interface Article {
  id: string; titre: string; auteur: string | null; categorie: string; tags: string[];
  datePublication: string; statutPublication: string; ordre: number;
  imagePrincipale: Media | null; traductions: Traduction[];
}

function traduction(a: Article, locale: 'FR' | 'HT') {
  return a.traductions.find((t) => t.locale === locale);
}
function joinList(v: string[]) { return v.join(', '); }
function splitList(v: string) { return v.split(',').map((s) => s.trim()).filter(Boolean); }
function toDateInput(iso: string) { return iso.slice(0, 10); }

export default function ActualitesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [uploading, setUploading] = useState(false);

  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [categorie, setCategorie] = useState<string>('COMMUNIQUE');
  const [tags, setTags] = useState('');
  const [datePublication, setDatePublication] = useState('');
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [imagePrincipaleId, setImagePrincipaleId] = useState<string | null>(null);
  const [resumeFr, setResumeFr] = useState('');
  const [contenuFr, setContenuFr] = useState('');
  const [resumeHt, setResumeHt] = useState('');
  const [contenuHt, setContenuHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: articlesData }, { data: mediasData }] = await Promise.all([
        actualitesApi.listAdmin(),
        mediaApi.list(),
      ]);
      setArticles(articlesData.data.articles);
      setMedias(mediasData.data.medias.filter((m: Media) => m.type === 'IMAGE'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setTitre('');
    setAuteur('');
    setCategorie('COMMUNIQUE');
    setTags('');
    setDatePublication(new Date().toISOString().slice(0, 10));
    setStatutPublication('BROUILLON');
    setOrdre(0);
    setImagePrincipaleId(null);
    setResumeFr('');
    setContenuFr('');
    setResumeHt('');
    setContenuHt('');
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(a: Article) {
    setEditing(a);
    setTitre(a.titre);
    setAuteur(a.auteur ?? '');
    setCategorie(a.categorie);
    setTags(joinList(a.tags));
    setDatePublication(toDateInput(a.datePublication));
    setStatutPublication(a.statutPublication);
    setOrdre(a.ordre);
    setImagePrincipaleId(a.imagePrincipale?.id ?? null);
    setResumeFr(traduction(a, 'FR')?.resume ?? '');
    setContenuFr(traduction(a, 'FR')?.contenu ?? '');
    setResumeHt(traduction(a, 'HT')?.resume ?? '');
    setContenuHt(traduction(a, 'HT')?.contenu ?? '');
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
      setImagePrincipaleId(data.data.media.id);
    } finally {
      setUploading(false);
    }
  }

  async function enregistrer() {
    setErreur(null);
    if (!titre.trim() || !resumeFr.trim() || !datePublication) {
      setErreur('Titre, résumé en français et date de publication sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', resume: resumeFr, contenu: contenuFr || undefined },
        ...(resumeHt.trim() ? [{ locale: 'HT', resume: resumeHt, contenu: contenuHt || undefined }] : []),
      ];
      const payload = {
        titre,
        auteur: auteur || undefined,
        categorie,
        tags: splitList(tags),
        datePublication,
        statutPublication,
        imagePrincipaleId: imagePrincipaleId || undefined,
        ordre,
        traductions,
      };
      if (editing) {
        await actualitesApi.update(editing.id, payload);
      } else {
        await actualitesApi.create(payload);
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

  async function supprimer(a: Article) {
    if (!confirm(`Supprimer "${a.titre}" ?`)) return;
    await actualitesApi.remove(a.id);
    await charger();
  }

  const mediaSelectionne = medias.find((m) => m.id === imagePrincipaleId);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Actualités</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Les articles affichés sur la page Actualités.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouvel article" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : articles.length === 0 ? (
          <EmptyState icon={Newspaper} title="Aucun article" hint="Créez le premier article" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Français</th>
                  <th>Kreyòl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td className="font-semibold">{a.titre}</td>
                    <td>{CATEGORIE_LABELS[a.categorie]}</td>
                    <td>{toDateInput(a.datePublication)}</td>
                    <td><Badge tone={STATUT_TONE[a.statutPublication]}>{STATUT_LABELS[a.statutPublication]}</Badge></td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'article" : 'Nouvel article'} maxWidth={760}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Titre</label>
            <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="ex: Inauguration du nouveau marché communal" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
              <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Date de publication</label>
              <input type="date" className="input" value={datePublication} onChange={(e) => setDatePublication(e.target.value)} />
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
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Auteur</label>
              <input className="input" value={auteur} onChange={(e) => setAuteur(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre (0 = affiché en premier)</label>
              <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Tags (séparés par des virgules)</label>
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-ink-3)' }}>
              Astuce : reprenez le nom exact d&apos;une personnalité comme tag pour que cet article apparaisse dans son onglet &laquo; Actualités &raquo;.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Image principale</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mediaSelectionne && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(mediaSelectionne.url)} alt={mediaSelectionne.nomOriginal} className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    onClick={() => setImagePrincipaleId(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-danger)', color: 'white' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
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
                {medias.filter((m) => m.id !== imagePrincipaleId).slice(0, 12).map((m) => (
                  <button key={m.id} onClick={() => setImagePrincipaleId(m.id)} title="Choisir cette image">
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
              <textarea className="input mb-2" rows={2} placeholder="Résumé" value={resumeFr} onChange={(e) => setResumeFr(e.target.value)} />
              <textarea className="input" rows={5} placeholder="Contenu complet (optionnel)" value={contenuFr} onChange={(e) => setContenuFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input mb-2" rows={2} placeholder="Rezime" value={resumeHt} onChange={(e) => setResumeHt(e.target.value)} />
              <textarea className="input" rows={5} placeholder="Kontni konplè (opsyonèl)" value={contenuHt} onChange={(e) => setContenuHt(e.target.value)} />
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
