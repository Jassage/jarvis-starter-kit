import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { omitUndefined } from '../lib/firestoreUtils';
import type { Cotisation } from '../types';

const cotisationsRef = collection(db, 'contributions');

export async function uploaderPreuveCotisation(fichier: File): Promise<string> {
  const chemin = `preuves/${Date.now()}-${fichier.name}`;
  const storageRef = ref(storage, chemin);
  await uploadBytes(storageRef, fichier);
  return getDownloadURL(storageRef);
}

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
  return addDoc(cotisationsRef, omitUndefined({ ...data, saisiLe: new Date().toISOString() }));
}

/**
 * Annule une cotisation (append-only : jamais de suppression ni de modification des montants).
 * Les règles Firestore n'autorisent la modification que du champ `annulee`, rien d'autre.
 */
export async function annulerCotisation(id: string, annulee: boolean) {
  return updateDoc(doc(db, 'contributions', id), { annulee });
}

/**
 * Regroupe une liste de cotisations pour ne garder que la plus récente, non annulée,
 * par (memberId, mois). Annuler la dernière correction fait naturellement réapparaître
 * la précédente (ou "non payé" s'il n'y en a aucune) sans jamais réécrire l'historique.
 */
export function valeursCourantes(cotisations: Cotisation[]): Map<string, Cotisation> {
  const parCle = new Map<string, Cotisation>();
  for (const c of cotisations) {
    if (c.annulee) continue;
    const cle = `${c.memberId}__${c.mois}`;
    const existante = parCle.get(cle);
    if (!existante || new Date(c.saisiLe) > new Date(existante.saisiLe)) {
      parCle.set(cle, c);
    }
  }
  return parCle;
}
