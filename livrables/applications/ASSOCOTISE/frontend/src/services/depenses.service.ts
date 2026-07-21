import {
  addDoc,
  collection,
  doc,
  limit as limiter,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { omitUndefined } from '../lib/firestoreUtils';
import type { Depense } from '../types';

const depensesRef = collection(db, 'expenses');

export function ecouterDepenses(cb: (depenses: Depense[]) => void) {
  const q = query(depensesRef, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Depense, 'id'>) })));
  });
}

/** Dépenses d'une plage de dates inclusive (« 2026-01-01 » à « 2026-12-31 »). */
export function ecouterDepensesPlage(
  dateDebut: string,
  dateFin: string,
  cb: (depenses: Depense[]) => void
) {
  const q = query(
    depensesRef,
    where('date', '>=', dateDebut),
    where('date', '<=', dateFin),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Depense, 'id'>) })));
  });
}

/** Dernières dépenses saisies, pour le journal d'audit. */
export function ecouterDernieresDepenses(limite: number, cb: (depenses: Depense[]) => void) {
  const q = query(depensesRef, orderBy('saisiLe', 'desc'), limiter(limite));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Depense, 'id'>) })));
  });
}

export async function uploaderJustificatif(fichier: File): Promise<string> {
  const chemin = `justificatifs/${Date.now()}-${fichier.name}`;
  const storageRef = ref(storage, chemin);
  await uploadBytes(storageRef, fichier);
  return getDownloadURL(storageRef);
}

export async function creerDepense(data: Omit<Depense, 'id' | 'saisiLe'>) {
  return addDoc(depensesRef, omitUndefined({ ...data, saisiLe: new Date().toISOString() }));
}

export async function modifierDepense(id: string, data: Partial<Omit<Depense, 'id' | 'saisiLe' | 'saisiPar'>>) {
  return updateDoc(doc(db, 'expenses', id), omitUndefined({ ...data, modifieLe: new Date().toISOString() }));
}

export async function annulerDepense(id: string, annulee: boolean, annuleePar: string) {
  return updateDoc(doc(db, 'expenses', id), {
    annulee,
    annuleePar,
    annuleeLe: new Date().toISOString(),
  });
}
