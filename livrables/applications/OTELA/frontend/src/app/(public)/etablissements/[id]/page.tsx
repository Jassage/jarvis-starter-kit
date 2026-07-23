import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Mail, Globe, Star, BedDouble } from 'lucide-react';
import Lightbox from './Lightbox';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Photo { id: string; url: string; legende: string | null; estPrincipale: boolean }
interface Tarif { devise: 'HTG' | 'USD'; typeSejour: 'NUITEE' | 'JOUR'; montant: string }
interface TypeChambre { id: string; nom: string; description: string | null; capaciteMax: number; equipements: string[]; photos: Photo[]; tarifs: Tarif[] }
interface AvisPublic { id: string; note: number; commentaire: string | null; reponseDirection: string | null; createdAt: string }
interface EtablissementVitrine {
  id: string; nom: string; adresse: string; commune: string; departement: string;
  logoUrl: string | null; description: string | null; equipements: string[];
  telephone: string | null; email: string | null; siteWeb: string | null;
  latitude: string | null; longitude: string | null;
  heureCheckIn: string; heureCheckOut: string;
  typesChambres: TypeChambre[];
  avis: AvisPublic[];
  avisMoyenne: number | null;
  avisTotal: number;
}

// Pas de cache ISR ici : un nouvel avis ou une réponse de la direction doit
// apparaître immédiatement (vérifié en conditions réelles — un revalidate de 60s
// masquait un avis venant d'être soumis).
async function fetchEtablissement(id: string): Promise<EtablissementVitrine | null> {
  const res = await fetch(`${API_URL}/etablissements/${id}/vitrine`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data.etablissement;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const etab = await fetchEtablissement(id);
  if (!etab) return { title: 'Établissement — OTELA' };

  const description = etab.description
    ?? `${etab.nom}, établissement OTELA à ${etab.commune}, ${etab.departement}. Réservez en ligne.`;

  return {
    title: `${etab.nom} — OTELA`,
    description,
    openGraph: {
      title: etab.nom,
      description,
      ...(etab.logoUrl && { images: [{ url: etab.logoUrl }] }),
    },
  };
}

function tarifIndicatif(type: TypeChambre) {
  const htg = type.tarifs.find((t) => t.devise === 'HTG' && t.typeSejour === 'NUITEE');
  const usd = type.tarifs.find((t) => t.devise === 'USD' && t.typeSejour === 'NUITEE');
  const tarif = htg ?? usd;
  if (!tarif) return null;
  return `à partir de ${Number(tarif.montant).toLocaleString('fr-FR')} ${tarif.devise} / nuit`;
}

export default async function EtablissementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const etab = await fetchEtablissement(id);
  if (!etab) notFound();

  const lat = etab.latitude ? Number(etab.latitude) : null;
  const lng = etab.longitude ? Number(etab.longitude) : null;
  const lienCarte = lat && lng
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${etab.adresse}, ${etab.commune}, Haïti`)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: etab.nom,
    description: etab.description ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: etab.adresse,
      addressLocality: etab.commune,
      addressRegion: etab.departement,
      addressCountry: 'HT',
    },
    telephone: etab.telephone ?? undefined,
    image: etab.logoUrl ?? undefined,
    ...(lat && lng && { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } }),
    ...(etab.avisTotal > 0 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: etab.avisMoyenne, reviewCount: etab.avisTotal },
    }),
  };

  return (
    <div>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {etab.logoUrl && <img src={etab.logoUrl} alt={etab.nom} className="w-16 h-16 rounded-2xl object-cover" />}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-ink)' }}>{etab.nom}</h1>
              <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-ink-3)' }}>
                <MapPin className="w-3.5 h-3.5" /> {etab.commune}, {etab.departement}
              </p>
              {etab.avisTotal > 0 && (
                <p className="text-sm flex items-center gap-1 mt-1" style={{ color: 'var(--color-ink-2)' }}>
                  <Star className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} fill="var(--color-accent)" />
                  {etab.avisMoyenne?.toFixed(1)} / 5 ({etab.avisTotal} avis)
                </p>
              )}
            </div>
          </div>
          <Link href={`/reserver?etablissementId=${etab.id}`} className="btn btn-gold shrink-0">Réserver ici</Link>
        </div>

        {etab.description && <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--color-ink-2)' }}>{etab.description}</p>}

        {etab.equipements.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {etab.equipements.map((eq) => <span key={eq} className="badge">{eq}</span>)}
          </div>
        )}

        {etab.typesChambres.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--color-ink)' }}>Nos chambres</h2>
            <div className="space-y-8">
              {etab.typesChambres.map((type) => (
                <div key={type.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-ink)' }}>
                        <BedDouble className="w-4 h-4" /> {type.nom}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Jusqu'à {type.capaciteMax} personnes</p>
                    </div>
                    {tarifIndicatif(type) && (
                      <span className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{tarifIndicatif(type)}</span>
                    )}
                  </div>
                  {type.description && <p className="text-sm mb-4" style={{ color: 'var(--color-ink-2)' }}>{type.description}</p>}
                  <Lightbox photos={type.photos} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="card p-5 space-y-2">
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--color-ink-3)' }}>COORDONNÉES</p>
            <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}><MapPin className="w-3.5 h-3.5" /> {etab.adresse}, {etab.commune}</p>
            {etab.telephone && <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}><Phone className="w-3.5 h-3.5" /> {etab.telephone}</p>}
            {etab.email && <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}><Mail className="w-3.5 h-3.5" /> {etab.email}</p>}
            {etab.siteWeb && <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}><Globe className="w-3.5 h-3.5" /> <a href={etab.siteWeb} target="_blank" rel="noopener noreferrer" className="underline">{etab.siteWeb}</a></p>}
            <a href={lienCarte} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline" style={{ color: 'var(--color-primary-2)' }}>Voir sur la carte</a>
          </div>
          <div className="card p-5 space-y-2">
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--color-ink-3)' }}>ARRIVÉE / DÉPART</p>
            <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Check-in dès {etab.heureCheckIn}</p>
            <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Check-out avant {etab.heureCheckOut}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--color-ink)' }}>Avis clients</h2>
          {etab.avis.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {etab.avis.map((a) => (
                <div key={a.id} className="card p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className="w-4 h-4" style={{ color: n <= a.note ? 'var(--color-accent)' : 'var(--color-line)' }} fill={n <= a.note ? 'var(--color-accent)' : 'none'} />
                    ))}
                    <span className="text-xs ml-2" style={{ color: 'var(--color-ink-3)' }}>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {a.commentaire && <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{a.commentaire}</p>}
                  {a.reponseDirection && (
                    <div className="mt-3 pl-3 border-l-2" style={{ borderColor: 'var(--color-line)' }}>
                      <p className="text-xs font-bold" style={{ color: 'var(--color-ink-3)' }}>Réponse de l'établissement</p>
                      <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{a.reponseDirection}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
