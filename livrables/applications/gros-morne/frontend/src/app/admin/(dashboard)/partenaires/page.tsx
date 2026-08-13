'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Handshake, Upload, X } from 'lucide-react';
import { partenairesApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const CATEGORIES = ['INSTITUTIONNEL', 'ENTREPRISE', 'SPONSOR', 'ONG', 'MECENE', 'MEDIA'] as const;
const CATEGORIE_LABELS: Record<string, string> = {
  INSTITUTIONNEL: 'Institutionnel', ENTREPRISE: 'Entreprise', SPONSOR: 'Sponsor', ONG: 'ONG & Diaspora', MECENE: 'Mécène', MEDIA: 'Médias',
};
const NIVEAUX = ['', 'PLATINE', 'OR', 'ARGENT', 'BRONZE'] as const;
const NIVEAU_LABELS: Record<string, string> = { '': 'Aucun', PLATINE: 'Platine', OR: 'Or', ARGENT: 'Argent', BRONZE: 'Bronze' };
const EMPLACEMENTS = ['ACCUEIL', 'A_PROPOS'] as const;
const EMPLACEMENT_LABELS: Record<string, string> = { ACCUEIL: 'Accueil', A_PROPOS: 'À propos' };
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Media { id: string; url: string; nomOriginal: string; type: string }
interface Partenaire {
  id: string;
  nom: string;
  categorie: string;
  niveau: string | null;
  lienSiteWeb: string | null;
  emplacements: string[];
  statutPublication: string;
  ordre: number;
  logo: Media | null;
}

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partenaire | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState<string>(CATEGORIES[0]);
  const [niveau, setNiveau] = useState('');
  const [lienSiteWeb, setLienSiteWeb] = useState('');
  const [logoId, setLogoId] = useState('');
  const [emplacements, setEmplacements] = useState<string[]>([]);
  const [statutPublication, setStatutPublication] = useState('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: mediasData }] = await Promise.all([partenairesApi.listAdmin(), mediaApi.list()]);
      setPartenaires(data.data.partenaires);
      setMedias(mediasData.data.medias.filter((m: Media) => m.type === 'IMAGE'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function uploaderLogo(fichier: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      setMedias((m) => [data.data.media, ...m]);
      setLogoId(data.data.media.id);
    } finally {
      setUploading(false);
    }
  }

  function toggleEmplacement(e: string) {
    setEmplacements((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  function ouvrirCreation() {
    setEditing(null);
    setNom('');
    setCategorie(CATEGORIES[0]);
    setNiveau('');
    setLienSiteWeb('');
    setLogoId('');
    setEmplacements([]);
    setStatutPublication('BROUILLON');
    setOrdre(partenaires.length);
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(p: Partenaire) {
    setEditing(p);
    setNom(p.nom);
    setCategorie(p.categorie);
    setNiveau(p.niveau ?? '');
    setLienSiteWeb(p.lienSiteWeb ?? '');
    setLogoId(p.logo?.id ?? '');
    setEmplacements(p.emplacements);
    setStatutPublication(p.statutPublication);
    setOrdre(p.ordre);
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim()) {
      setErreur('Nom requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const payload = {
        nom,
        categorie,
        niveau: niveau || undefined,
        lienSiteWeb: lienSiteWeb || undefined,
        logoId: logoId || undefined,
        emplacements,
        statutPublication,
        ordre,
      };
      if (editing) {
        await partenairesApi.update(editing.id, payload);
      } else {
        await partenairesApi.create(payload);
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

  async function supprimer(p: Partenaire) {
    if (!confirm(`Supprimer le partenaire "${p.nom}" ?`)) return;
    await partenairesApi.remove(p.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Partenaires & sponsors</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Affichés sur l&apos;accueil et/ou la page À propos selon les emplacements cochés.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouveau partenaire" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : partenaires.length === 0 ? (
          <EmptyState icon={Handshake} title="Aucun partenaire" hint="Ajoutez le premier partenaire" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Niveau</th>
                  <th>Emplacements</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {partenaires.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.nom}</td>
                    <td>{CATEGORIE_LABELS[p.categorie]}</td>
                    <td>{p.niveau ? NIVEAU_LABELS[p.niveau] : '—'}</td>
                    <td>{p.emplacements.map((e) => EMPLACEMENT_LABELS[e]).join(', ') || '—'}</td>
                    <td><Badge tone={STATUT_TONE[p.statutPublication]}>{STATUT_LABELS[p.statutPublication]}</Badge></td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(p)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => supprimer(p)} className="btn" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le partenaire' : 'Nouveau partenaire'} maxWidth={680}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Francisque FM 98.9" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Lien site web (optionnel)</label>
              <input className="input" value={lienSiteWeb} onChange={(e) => setLienSiteWeb(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
              <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Niveau</label>
              <select className="input" value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                {NIVEAUX.map((n) => <option key={n} value={n}>{NIVEAU_LABELS[n]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Statut</label>
              <select className="input" value={statutPublication} onChange={(e) => setStatutPublication(e.target.value)}>
                {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Emplacements d&apos;affichage</label>
            <div className="flex gap-4">
              {EMPLACEMENTS.map((e) => (
                <label key={e} className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
                  <input type="checkbox" checked={emplacements.includes(e)} onChange={() => toggleEmplacement(e)} />
                  {EMPLACEMENT_LABELS[e]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
            <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} style={{ maxWidth: 120 }} />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Logo (optionnel)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {logoId && medias.find((m) => m.id === logoId) && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(medias.find((m) => m.id === logoId)!.url)} alt={nom} className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
                  <button onClick={() => setLogoId('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-danger)', color: 'white' }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-line)' }}>
                <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploaderLogo(f); e.target.value = ''; }} />
              </label>
            </div>
            {medias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medias.filter((m) => m.id !== logoId).slice(0, 12).map((m) => (
                  <button key={m.id} onClick={() => setLogoId(m.id)} title="Utiliser ce logo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(m.url)} alt={m.nomOriginal} className="w-12 h-12 object-contain rounded-lg bg-gray-50 opacity-50 hover:opacity-100 transition-opacity" />
                  </button>
                ))}
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
