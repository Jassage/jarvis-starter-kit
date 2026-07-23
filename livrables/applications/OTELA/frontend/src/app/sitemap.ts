import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3008';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Etablissement { id: string; updatedAt: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statiques: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/reserver`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/cgu`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const res = await fetch(`${API_URL}/etablissements`, { next: { revalidate: 3600 } });
    if (!res.ok) return statiques;
    const json = await res.json();
    const etablissements: Etablissement[] = json.data.etablissements;

    const dynamiques: MetadataRoute.Sitemap = etablissements.map((e) => ({
      url: `${SITE_URL}/etablissements/${e.id}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...statiques, ...dynamiques];
  } catch {
    return statiques;
  }
}
