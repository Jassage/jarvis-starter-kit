import type { Metadata } from 'next';
import { MapPin, Phone, Mail } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const metadata: Metadata = {
  title: 'Contact — OTELA',
  description: 'Coordonnées de tous les établissements de la chaîne hôtelière OTELA en Haïti.',
};

interface Etablissement {
  id: string; nom: string; adresse: string; commune: string; departement: string;
  telephone: string | null; email: string | null;
}

async function fetchEtablissements(): Promise<Etablissement[]> {
  const res = await fetch(`${API_URL}/etablissements`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data.etablissements;
}

export default async function ContactPage() {
  const etablissements = await fetchEtablissements();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--color-ink)' }}>Contactez-nous</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--color-ink-3)' }}>Une question sur un établissement ? Écrivez-lui directement, ou contactez celui le plus proche de vous.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {etablissements.map((e) => (
          <div key={e.id} className="card p-6">
            <h2 className="font-bold text-base mb-2" style={{ color: 'var(--color-ink)' }}>{e.nom}</h2>
            <p className="text-sm flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
              <MapPin className="w-3.5 h-3.5" /> {e.adresse}, {e.commune}, {e.departement}
            </p>
            {e.telephone && (
              <p className="text-sm flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
                <Phone className="w-3.5 h-3.5" /> <a href={`tel:${e.telephone}`} className="underline">{e.telephone}</a>
              </p>
            )}
            {e.email && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}>
                <Mail className="w-3.5 h-3.5" /> <a href={`mailto:${e.email}`} className="underline">{e.email}</a>
              </p>
            )}
          </div>
        ))}
      </div>

      {etablissements.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun établissement disponible pour le moment.</p>
      )}
    </div>
  );
}
