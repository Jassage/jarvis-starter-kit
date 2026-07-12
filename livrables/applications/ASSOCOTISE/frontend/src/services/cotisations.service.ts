import { addDoc, collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Cotisation } from '../types';

const cotisationsRef = collection(db, 'contributions');

export function ecouterCotisationsDuMois(mois: string, cb: (cotisations: Cotisation[]) => void) {
  const q = query(cotisationsRef, where('mois', '==', mois), orderBy('saisiLe', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cotisation, 'id'>) })));
  });
}

export function ecouterToutesCotisations(cb: (cotisations: Cotisation[]) => void) {
  const q = query(cotisationsRef, orderBy('saisiLe', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cotisation, 'id'>) })));
  });
}

export async function listerCotisationsMembre(memberId: string): Promise<Cotisation[]> {
  const q = query(cotisationsRef, where('memberId', '==', memberId), orderBy('saisiLe', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cotisation, 'id'>) }));
}

/**
 * Enregistre une cotisation (ou une correction). Toujours un nouveau document —
 * les règles Firestore interdisent update/delete sur `contributions`, l'historique
 * complet reste donc consultable, jamais écrasé.
 */
export async function saisirCotisation(data: Omit<Cotisation, 'id' | 'saisiLe'>) {
  return addDoc(cotisationsRef, { ...data, saisiLe: new Date().toISOString() });
}

/** Regroupe une liste de cotisations pour ne garder que la plus récente par (memberId, mois). */
export function valeursCourantes(cotisations: Cotisation[]): Map<string, Cotisation> {
  const parCle = new Map<string, Cotisation>();
  for (const c of cotisations) {
    const cle = `${c.memberId}__${c.mois}`;
    const existante = parCle.get(cle);
    if (!existante || new Date(c.saisiLe) > new Date(existante.saisiLe)) {
      parCle.set(cle, c);
    }
  }
  return parCle;
}
