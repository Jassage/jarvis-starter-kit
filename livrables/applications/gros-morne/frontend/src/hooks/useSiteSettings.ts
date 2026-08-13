'use client';

import { useEffect, useState } from 'react';
import { siteSettingsApi } from '@/lib/api';

export interface SiteSettings {
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  horaires: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  siteWebUrl: string | null;
}

// Partagé par le Footer et la page Contact : un seul fetch, une seule source de vérité pour
// les coordonnées de la commune. Tant que l'admin n'a rien renseigné (tous les champs sont
// nullable côté API), chaque consommateur applique son propre repli visuel plutôt que
// d'afficher un vide brut.
export function useSiteSettings() {
  const [parametres, setParametres] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    siteSettingsApi
      .get()
      .then(({ data }) => setParametres(data.data.parametres))
      .finally(() => setLoading(false));
  }, []);

  return { parametres, loading };
}
