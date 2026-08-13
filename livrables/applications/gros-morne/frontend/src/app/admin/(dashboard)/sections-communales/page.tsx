'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, TreePine, Upload, X } from 'lucide-react';
import { sectionsCommunalesApi, mediaApi, mediaUrl } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

interface Traduction {
  id: string;
  locale: 'FR' | 'HT';
  description: string;
  activitesPrincipales: string[];
}

interface Media { id: string; url: string; nomOriginal: string; type: string }

interface SectionCommunale {
  id: string;
  nom: string;
  principale: boolean;
  couleur: string;
  population: number | null;
  photoUrl: string | null;
  ordre: number;
  traductions: Traduction[];
}

function traduction(section: SectionCommunale, locale: 'FR' | 'HT') {
  return section.traductions.find((t) => t.locale === locale);
}

export default function SectionsCommunalesPage() {
  const [sections, setSections] = useState<SectionCommunale[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SectionCommunale | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nom, setNom] = useState('');
  const [principale, setPrincipale] = useState(false);
  const [couleur, setCouleur] = useState('from-green-500 to-emerald-600');
  const [population, setPopulation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [ordre, setOrdre] = useState(0);
  const [descriptionFr, setDescriptionFr] = useState('');
  const [activitesFr, setActivitesFr] = useState('');
  const [descriptionHt, setDescriptionHt] = useState('');
  const [activitesHt, setActivitesHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: mediasData }] = await Promise.all([sectionsCommunalesApi.list(), mediaApi.list()]);
      setSections(data.data.sections);
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

  function splitActivites(valeur: string) {
    return valeur
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function ouvrirCreation() {
    setEditing(null);
    setNom('');
    setPrincipale(false);
    setCouleur('from-green-500 to-emerald-600');
    setPopulation('');
    setPhotoUrl('');
    setOrdre(sections.length);
    setDescriptionFr('');
    setActivitesFr('');
    setDescriptionHt('');
    setActivitesHt('');
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(section: SectionCommunale) {
    setEditing(section);
    setNom(section.nom);
    setPrincipale(section.principale);
    setCouleur(section.couleur);
    setPopulation(section.population != null ? String(section.population) : '');
    setPhotoUrl(section.photoUrl ?? '');
    setOrdre(section.ordre);
    setDescriptionFr(traduction(section, 'FR')?.description ?? '');
    setActivitesFr(traduction(section, 'FR')?.activitesPrincipales.join(', ') ?? '');
    setDescriptionHt(traduction(section, 'HT')?.description ?? '');
    setActivitesHt(traduction(section, 'HT')?.activitesPrincipales.join(', ') ?? '');
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim() || !couleur.trim() || !descriptionFr.trim()) {
      setErreur('Nom, couleur et description en français sont requis.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', description: descriptionFr, activitesPrincipales: splitActivites(activitesFr) },
        ...(descriptionHt.trim()
          ? [{ locale: 'HT', description: descriptionHt, activitesPrincipales: splitActivites(activitesHt) }]
          : []),
      ];
      const payload = {
        nom,
        principale,
        couleur,
        population: population ? Number(population) : undefined,
        photoUrl: photoUrl || undefined,
        ordre,
        traductions,
      };
      if (editing) {
        await sectionsCommunalesApi.update(editing.id, payload);
      } else {
        await sectionsCommunalesApi.create(payload);
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

  async function supprimer(section: SectionCommunale) {
    if (!confirm(`Supprimer la section "${section.nom}" ?`)) return;
    await sectionsCommunalesApi.remove(section.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Sections communales</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Les 8 sections communales affichées sur l&apos;accueil et la page Géographie.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouvelle section" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : sections.length === 0 ? (
          <EmptyState icon={TreePine} title="Aucune section communale" hint="Créez la première section" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Ordre</th>
                  <th>Population</th>
                  <th>Français</th>
                  <th>Kreyòl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td className="font-semibold">
                      <div className="flex items-center gap-2">
                        {section.nom}
                        {section.principale && <Badge tone="success">Principale</Badge>}
                      </div>
                    </td>
                    <td>{section.ordre}</td>
                    <td>{section.population ?? '—'}</td>
                    <td>
                      {traduction(section, 'FR') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}
                    </td>
                    <td>
                      {traduction(section, 'HT') ? <Badge tone="success">Renseigné</Badge> : <Badge tone="warning">Manquant</Badge>}
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(section)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimer(section)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la section' : 'Nouvelle section'} maxWidth={680}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Boucan Richard" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Population</label>
              <input type="number" className="input" value={population} onChange={(e) => setPopulation(e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Couleur (dégradé Tailwind)</label>
              <input className="input" value={couleur} onChange={(e) => setCouleur(e.target.value)} placeholder="from-green-500 to-emerald-600" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
              <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
            </div>
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
          <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            <input type="checkbox" checked={principale} onChange={(e) => setPrincipale(e.target.checked)} />
            Section principale (centre administratif)
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <textarea className="input mb-2" rows={3} placeholder="Description" value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} />
              <input className="input" placeholder="Activités principales (séparées par des virgules)" value={activitesFr} onChange={(e) => setActivitesFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <textarea className="input mb-2" rows={3} placeholder="Deskripsyon" value={descriptionHt} onChange={(e) => setDescriptionHt(e.target.value)} />
              <input className="input" placeholder="Aktivite prensipal yo (separe ak vigil)" value={activitesHt} onChange={(e) => setActivitesHt(e.target.value)} />
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
