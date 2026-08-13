'use client';

import { useEffect, useState, useCallback } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { heroImagesApi, mediaApi, mediaUrl } from '@/lib/api';

const PAGES: { key: string; label: string }[] = [
  { key: 'accueil', label: 'Accueil' },
  { key: 'histoire', label: 'Histoire' },
  { key: 'geographie', label: 'Géographie' },
  { key: 'culture', label: 'Culture' },
  { key: 'personnalites', label: 'Personnalités' },
  { key: 'tourisme', label: 'Tourisme' },
  { key: 'communaute', label: 'Communauté' },
  { key: 'actualites', label: 'Actualités' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'annuaire', label: 'Annuaire' },
  { key: 'investir', label: 'Investir' },
  { key: 'diaspora', label: 'Diaspora' },
  { key: 'contact', label: 'Contact' },
  { key: 'a-propos', label: 'À propos' },
  { key: 'faq', label: 'FAQ' },
  { key: 'services-municipaux', label: 'Services municipaux' },
  { key: 'vie-associative', label: 'Vie associative' },
  { key: 'education', label: 'Éducation' },
  { key: 'sante', label: 'Santé' },
  { key: 'economie', label: 'Économie' },
  { key: 'mentions-legales', label: 'Mentions légales' },
  { key: 'confidentialite', label: 'Confidentialité' },
  { key: 'conditions-utilisation', label: "Conditions d'utilisation" },
  { key: 'galerie', label: 'Galerie' },
  { key: 'documents', label: 'Documents' },
];

interface Media { id: string; url: string; nomOriginal: string }
interface HeroImage { page: string; media: Media }

export default function ImagesHeroPage() {
  const [images, setImages] = useState<Record<string, Media>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingPage, setUploadingPage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await heroImagesApi.listAdmin();
      const map: Record<string, Media> = {};
      (data.data.images as HeroImage[]).forEach((img) => { map[img.page] = img.media; });
      setImages(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function uploaderEtAssocier(page: string, fichier: File) {
    setUploadingPage(page);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      const { data } = await mediaApi.upload(formData);
      await heroImagesApi.upsert(page, data.data.media.id);
      setImages((prev) => ({ ...prev, [page]: data.data.media }));
    } finally {
      setUploadingPage(null);
    }
  }

  async function retirer(page: string) {
    if (!confirm('Retirer cette image de fond ? La page reviendra à un fond neutre.')) return;
    await heroImagesApi.remove(page);
    setImages((prev) => {
      const next = { ...prev };
      delete next[page];
      return next;
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Images de fond</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        L&apos;image affichée en fond du hero de chaque page. Sans image, la page affiche un dégradé neutre.
      </p>

      <div className="card p-5 sm:p-6">
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAGES.map(({ key, label }) => {
              const media = images[key];
              return (
                <div key={key} className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-line)' }}>
                  <div className="h-32 relative flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }}>
                    {media ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(media.url)} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5" style={{ color: 'var(--color-ink-3)' }}>
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">Aucune image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', cursor: 'pointer' }}>
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingPage === key}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploaderEtAssocier(key, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {media && (
                        <button
                          onClick={() => retirer(key)}
                          className="btn"
                          style={{ padding: '0.35rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
