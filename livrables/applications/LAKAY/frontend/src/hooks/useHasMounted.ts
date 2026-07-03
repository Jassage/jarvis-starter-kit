'use client';
import { useEffect, useState } from 'react';

/**
 * Vrai seulement après le premier rendu client. Sert à retarder l'affichage
 * d'un état lu depuis localStorage/Zustand (ex. isAuthenticated) jusqu'à ce
 * que le rendu client corresponde au HTML serveur, pour éviter les erreurs
 * d'hydratation React (le serveur ne peut jamais savoir si l'utilisateur est
 * connecté).
 */
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
