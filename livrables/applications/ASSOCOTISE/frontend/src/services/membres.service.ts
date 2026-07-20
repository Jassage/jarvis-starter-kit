import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { omitUndefined } from '../lib/firestoreUtils';
import type { Membre, StatutMembre } from '../types';

const membresRef = collection(db, 'members');

export function ecouterMembres(cb: (membres: Membre[]) => void) {
  const q = query(membresRef, orderBy('nom'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Membre, 'id'>) })));
  });
}

export async function listerMembres(): Promise<Membre[]> {
  const snap = await getDocs(query(membresRef, orderBy('nom')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Membre, 'id'>) }));
}

export async function creerMembre(data: Omit<Membre, 'id'>) {
  return addDoc(membresRef, omitUndefined(data));
}

export async function modifierMembre(id: string, data: Partial<Omit<Membre, 'id'>>) {
  return updateDoc(doc(db, 'members', id), omitUndefined(data));
}

export async function changerStatutMembre(id: string, statut: StatutMembre) {
  return updateDoc(doc(db, 'members', id), { statut });
}
