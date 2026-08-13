'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Award, Upload, X, Plus } from 'lucide-react';
import { personnalitesApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const CATEGORIES = ['POLITIQUE', 'CULTURE', 'EDUCATION', 'SPORT', 'ENTREPRENEURIAT', 'AUTRE'] as const;
const CATEGORIE_LABELS: Record<string, string> = {
  POLITIQUE: 'Politique & Gouvernance', CULTURE: 'Culture & Arts', EDUCATION: 'Éducation & Sciences',
  SPORT: 'Sports', ENTREPRENEURIAT: 'Entrepreneuriat', AUTRE: 'Autres',
};

interface Traduction {
  id: string;
  locale: 'FR' | 'HT';
  domaine: string;
  biographie: string;
  realisations: string[];
  citation: string | null;
}

interface Personnalite {
  id: string;
  nom: string;
  periode: string | null;
  photoUrl: string | null;
  categorie: string;
  dateNaissance: string | null;
  lieuNaissance: string | null;
  nationalite: string | null;
  profession: string | null;
  periodeActivite: string | null;
  ordre: number;
  traductions: Traduction[];
}

interface Media { id: string; url: string; nomOriginal: string; type: string }
interface EtapeTraduction { locale: 'FR' | 'HT'; titre: string; description: string }
interface Etape { id: string; annee: string; traductions: EtapeTraduction[] }
interface Photo { id: string; media: { id: string; url: string } }

function traduction(p: Personnalite, locale: 'FR' | 'HT') {
  return p.traductions.find((t) => t.locale === locale);
}

function dateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : '';
}

export default function PersonnalitesPage() {
  const [personnalites, setPersonnalites] = useState<Personnalite[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Personnalite | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nom, setNom] = useState('');
  const [periode, setPeriode] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [categorie, setCategorie] = useState<string>('AUTRE');
  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [profession, setProfession] = useState('');
  const [periodeActivite, setPeriodeActivite] = useState('');
  const [ordre, setOrdre] = useState(0);
  const [domaineFr, setDomaineFr] = useState('');
  const [biographieFr, setBiographieFr] = useState('');
  const [realisationsFr, setRealisationsFr] = useState('');
  const [citationFr, setCitationFr] = useState('');
  const [domaineHt, setDomaineHt] = useState('');
  const [biographieHt, setBiographieHt] = useState('');
  const [realisationsHt, setRealisationsHt] = useState('');
  const [citationHt, setCitationHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [nouvelleAnnee, setNouvelleAnnee] = useState('');
  const [nouveauTitre, setNouveauTitre] = useState('');
  const [nouvelleDescription, setNouvelleDescription] = useState('');

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: mediasData }] = await Promise.all([personnalitesApi.list(), mediaApi.list()]);
      setPersonnalites(data.data.personnalites);
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
      setPhotoUrl(data.data.media.url);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    charger();
  }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setNom('');
    setPeriode('');
    setPhotoUrl('');
    setCategorie('AUTRE');
    setDateNaissance('');
    setLieuNaissance('');
    setNationalite('');
    setProfession('');
    setPeriodeActivite('');
    setOrdre(personnalites.length);
    setDomaineFr('');
    setBiographieFr('');
    setRealisationsFr('');
    setCitationFr('');
    setDomaineHt('');
    setBiographieHt('');
    setRealisationsHt('');
    setCitationHt('');
    setEtapes([]);
    setPhotos([]);
    setErreur(null);
    setModalOpen(true);
  }

  async function ouvrirEdition(p: Personnalite) {
    setEditing(p);
    setNom(p.nom);
    setPeriode(p.periode ?? '');
    setPhotoUrl(p.photoUrl ?? '');
    setCategorie(p.categorie ?? 'AUTRE');
    setDateNaissance(dateInput(p.dateNaissance));
    setLieuNaissance(p.lieuNaissance ?? '');
    setNationalite(p.nationalite ?? '');
    setProfession(p.profession ?? '');
    setPeriodeActivite(p.periodeActivite ?? '');
    setOrdre(p.ordre);
    setDomaineFr(traduction(p, 'FR')?.domaine ?? '');
    setBiographieFr(traduction(p, 'FR')?.biographie ?? '');
    setRealisationsFr((traduction(p, 'FR')?.realisations ?? []).join('\n'));
    setCitationFr(traduction(p, 'FR')?.citation ?? '');
    setDomaineHt(traduction(p, 'HT')?.domaine ?? '');
    setBiographieHt(traduction(p, 'HT')?.biographie ?? '');
    setRealisationsHt((traduction(p, 'HT')?.realisations ?? []).join('\n'));
    setCitationHt(traduction(p, 'HT')?.citation ?? '');
    setEtapes([]);
    setPhotos([]);
    setNouvelleAnnee('');
    setNouveauTitre('');
    setNouvelleDescription('');
    setErreur(null);
    setModalOpen(true);
    // La liste n'inclut pas étapes/photos (uniquement la fiche détail) : chargées à part.
    const { data } = await personnalitesApi.get(p.id);
    setEtapes(data.data.personnalite.etapes ?? []);
    setPhotos(data.data.personnalite.photos ?? []);
  }

  async function ajouterEtape() {
    if (!editing || !nouvelleAnnee.trim() || !nouveauTitre.trim() || !nouvelleDescription.trim()) return;
    const { data } = await personnalitesApi.ajouterEtape(editing.id, {
      annee: nouvelleAnnee,
      ordre: etapes.length,
      traductions: [{ locale: 'FR', titre: nouveauTitre, description: nouvelleDescription }],
    });
    setEtapes((e) => [...e, data.data.etape]);
    setNouvelleAnnee('');
    setNouveauTitre('');
    setNouvelleDescription('');
  }

  async function supprimerEtapeHandler(etapeId: string) {
    await personnalitesApi.supprimerEtape(etapeId);
    setEtapes((e) => e.filter((x) => x.id !== etapeId));
  }

  async function ajouterPhotoGalerie(mediaId: string) {
    if (!editing) return;
    const { data } = await personnalitesApi.ajouterPhoto(editing.id, mediaId, photos.length);
    setPhotos((p) => [...p, data.data.photo]);
  }

  async function supprimerPhotoGalerie(photoId: string) {
    await personnalitesApi.supprimerPhoto(photoId);
    setPhotos((p) => p.filter((x) => x.id !== photoId));
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !domaineFr.trim() || !biographieFr.trim()) {
      setErreur('Nom, domaine et biographie en français sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const lignes = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
      const traductions = [
        { locale: 'FR', domaine: domaineFr, biographie: biographieFr, realisations: lignes(realisationsFr), citation: citationFr || undefined },
        ...(domaineHt.trim() && biographieHt.trim()
          ? [{ locale: 'HT', domaine: domaineHt, biographie: biographieHt, realisations: lignes(realisationsHt), citation: citationHt || undefined }]
          : []),
      ];
      const payload = {
        nom,
        periode: periode || undefined,
        photoUrl: photoUrl || undefined,
        categorie,
        dateNaissance: dateNaissance || undefined,
        lieuNaissance: lieuNaissance || undefined,
        nationalite: nationalite || undefined,
        profession: profession || undefined,
        periodeActivite: periodeActivite || undefined,
        ordre,
        traductions,
      };
      if (editing) {
        await personnalitesApi.update(editing.id, payload);
      } else {
        await personnalitesApi.create(payload);
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

  async function supprimer(p: Personnalite) {
    if (!confirm(`Supprimer "${p.nom}" ?`)) return;
    await personnalitesApi.remove(p.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Personnalités</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Les fils et filles de Gros-Morne présentés sur la page Personnalités.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouvelle personnalité" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : personnalites.length === 0 ? (
          <EmptyState icon={Award} title="Aucune personnalité" hint="Créez la première fiche" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Période</th>
                  <th>Ordre</th>
                  <th>Français</th>
                  <th>Kreyòl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {personnalites.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.nom}</td>
                    <td>{CATEGORIE_LABELS[p.categorie] ?? p.categorie}</td>
                    <td>{p.periode ?? '—'}</td>
                    <td>{p.ordre}</td>
                    <td>{traduction(p, 'FR') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>{traduction(p, 'HT') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(p)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimer(p)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la personnalité' : 'Nouvelle personnalité'} maxWidth={680}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Paul Prompt" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
              <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Date de naissance</label>
              <input type="date" className="input" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Lieu de naissance</label>
              <input className="input" value={lieuNaissance} onChange={(e) => setLieuNaissance(e.target.value)} placeholder="ex: Gros-Morne, Haïti" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nationalité</label>
              <input className="input" value={nationalite} onChange={(e) => setNationalite(e.target.value)} placeholder="ex: Haïtienne" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Profession</label>
              <input className="input" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="ex: Homme politique" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Période d&apos;activité</label>
              <input className="input" value={periodeActivite} onChange={(e) => setPeriodeActivite(e.target.value)} placeholder="ex: 1970 – Aujourd'hui" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Période (libellé affiché sous forme courte)</label>
            <input className="input" value={periode} onChange={(e) => setPeriode(e.target.value)} placeholder="ex: XVIIIe–XIXe siècle" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
            <input type="number" className="input" style={{ maxWidth: '8rem' }} value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Photo</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photoUrl && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(photoUrl)} alt={nom} className="w-16 h-16 object-cover rounded-lg" />
                  <button onClick={() => setPhotoUrl('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-danger)', color: 'white' }}>
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
                {medias.filter((m) => m.url !== photoUrl).slice(0, 12).map((m) => (
                  <button key={m.id} onClick={() => setPhotoUrl(m.url)} title="Utiliser cette photo">
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
              <input className="input mb-2" placeholder="Domaine (ex: Politique)" value={domaineFr} onChange={(e) => setDomaineFr(e.target.value)} />
              <textarea className="input mb-2" rows={5} placeholder="Biographie" value={biographieFr} onChange={(e) => setBiographieFr(e.target.value)} />
              <textarea className="input mb-2" rows={4} placeholder={"Réalisations majeures (une par ligne)"} value={realisationsFr} onChange={(e) => setRealisationsFr(e.target.value)} />
              <input className="input" placeholder="Citation (facultatif)" value={citationFr} onChange={(e) => setCitationFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <input className="input mb-2" placeholder="Domèn" value={domaineHt} onChange={(e) => setDomaineHt(e.target.value)} />
              <textarea className="input mb-2" rows={5} placeholder="Byografi" value={biographieHt} onChange={(e) => setBiographieHt(e.target.value)} />
              <textarea className="input mb-2" rows={4} placeholder={"Reyalizasyon enpòtan (youn pa liy)"} value={realisationsHt} onChange={(e) => setRealisationsHt(e.target.value)} />
              <input className="input" placeholder="Sitasyon (fakiltatif)" value={citationHt} onChange={(e) => setCitationHt(e.target.value)} />
            </div>
          </div>

          {editing && (
            <>
              <div className="h-px" style={{ background: 'var(--color-line)' }} />
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Parcours (onglet fiche détail)</p>
                <div className="flex flex-col gap-2 mb-3">
                  {etapes.map((e) => {
                    const et = e.traductions.find((t) => t.locale === 'FR');
                    return (
                      <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg p-2.5" style={{ background: 'var(--color-surface-2)' }}>
                        <div className="min-w-0">
                          <span className="text-xs font-bold" style={{ color: 'var(--color-primary-2)' }}>{e.annee}</span>
                          <p className="text-sm font-semibold truncate">{et?.titre}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>{et?.description}</p>
                        </div>
                        <button onClick={() => supprimerEtapeHandler(e.id)} className="btn shrink-0" style={{ padding: '0.3rem 0.5rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {etapes.length === 0 && <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucune étape pour le moment.</p>}
                </div>
                <div className="grid sm:grid-cols-[6rem_1fr] gap-2 mb-2">
                  <input className="input" placeholder="Année" value={nouvelleAnnee} onChange={(e) => setNouvelleAnnee(e.target.value)} />
                  <input className="input" placeholder="Titre de l'étape" value={nouveauTitre} onChange={(e) => setNouveauTitre(e.target.value)} />
                </div>
                <textarea className="input mb-2" rows={2} placeholder="Description" value={nouvelleDescription} onChange={(e) => setNouvelleDescription(e.target.value)} />
                <button onClick={ajouterEtape} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                  <Plus className="w-3.5 h-3.5" /> Ajouter l&apos;étape
                </button>
              </div>

              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Galerie (onglet fiche détail)</p>
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {photos.map((p) => (
                      <div key={p.id} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mediaUrl(p.media.url)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        <button onClick={() => supprimerPhotoGalerie(p.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-danger)', color: 'white' }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {medias.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medias.filter((m) => !photos.some((p) => p.media.id === m.id)).slice(0, 12).map((m) => (
                      <button key={m.id} onClick={() => ajouterPhotoGalerie(m.id)} title="Ajouter à la galerie">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mediaUrl(m.url)} alt={m.nomOriginal} className="w-12 h-12 object-cover rounded-lg opacity-50 hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="h-px" style={{ background: 'var(--color-line)' }} />
            </>
          )}

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
