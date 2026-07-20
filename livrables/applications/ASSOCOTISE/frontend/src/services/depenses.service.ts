import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
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

export async function annulerDepense(id: string, annulee: boolean) {
  return updateDoc(doc(db, 'expenses', id), { annulee });
}
