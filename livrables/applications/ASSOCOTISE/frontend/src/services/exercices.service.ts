import { collection, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { omitUndefined } from '../lib/firestoreUtils';
import { valeursCourantes } from './cotisations.service';
import type { Cotisation, Depense, Exercice } from '../types';

const exercicesRef = collection(db, 'exercices');

export function anneeCourante(): string {
  return String(new Date().getFullYear());
}

export function ecouterExercices(cb: (exercices: Exercice[]) => void) {
  return onSnapshot(query(exercicesRef, orderBy('annee', 'desc')), (snap) => {
    cb(snap.docs.map((d) => d.data() as Exercice));
  });
}

export async function listerExercices(): Promise<Exercice[]> {
  const snap = await getDocs(query(exercicesRef, orderBy('annee', 'desc')));
  return snap.docs.map((d) => d.data() as Exercice);
}

/**
 * Totaux d'une année. Les cotisations passent par `valeursCourantes` pour ne compter
 * qu'une seule fois un mois corrigé plusieurs fois, et les documents annulés sont exclus
 * des deux côtés.
 */
export function calculerTotauxExercice(cotisations: Cotisation[], depenses: Depense[]) {
  const totalCotise = [...valeursCourantes(cotisations).values()].reduce((s, c) => s + c.montant, 0);
  const totalDepense = depenses.filter((d) => !d.annulee).reduce((s, d) => s + d.montant, 0);
  return { totalCotise, totalDepense };
}

/**
 * Clôture une année et reporte son solde final sur l'exercice suivant, qui est créé s'il
 * n'existe pas encore. Le calcul est fait par l'appelant à partir des données déjà chargées :
 * sans backend, il n'y a pas d'autre endroit où le faire.
 */
export async function cloturerExercice(params: {
  annee: string;
  soldeReporte: number;
  totalCotise: number;
  totalDepense: number;
  cloturePar: string;
}) {
  const { annee, soldeReporte, totalCotise, totalDepense, cloturePar } = params;
  const soldeFinal = soldeReporte + totalCotise - totalDepense;

  await setDoc(doc(db, 'exercices', annee), {
    annee,
    statut: 'cloture',
    soldeReporte,
    totalCotise,
    totalDepense,
    soldeFinal,
    clotureLe: new Date().toISOString(),
    cloturePar,
  });

  const anneeSuivante = String(Number(annee) + 1);
  await setDoc(
    doc(db, 'exercices', anneeSuivante),
    { annee: anneeSuivante, statut: 'ouvert', soldeReporte: soldeFinal },
    { merge: true }
  );

  return soldeFinal;
}

export async function rouvrirExercice(annee: string, rouvertPar: string) {
  return updateDoc(doc(db, 'exercices', annee), {
    statut: 'ouvert',
    rouvertLe: new Date().toISOString(),
    rouvertPar,
  });
}

/** Crée l'exercice s'il manque, pour pouvoir enregistrer un solde reporté initial. */
export async function creerExerciceSiAbsent(annee: string, soldeReporte = 0) {
  return setDoc(
    doc(db, 'exercices', annee),
    omitUndefined({ annee, statut: 'ouvert', soldeReporte }),
    { merge: true }
  );
}
