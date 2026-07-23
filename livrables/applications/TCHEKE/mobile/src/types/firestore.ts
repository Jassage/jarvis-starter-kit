/**
 * Types partages du modele de donnees Firestore (voir PLAN.md et
 * worker/src/borlette/mapping.ts). Meme contrat cote app que cote worker :
 * toutes les valeurs de tirage restent en `string`, jamais en `number`.
 */

export type Etat = "NY" | "FL";
export type Moment = "MIDI" | "SOIR";
export type StatutTirage = "OFFICIEL";

export interface Tirage {
  date: string; // YYYY-MM-DD
  etat: Etat;
  moment: Moment;
  lotto3: string;
  lotto4: string;
  premyeLo: string;
  dezyemLo: string;
  twazyemLo: string;
  statut: StatutTirage;
  publieLe: { seconds: number; nanoseconds: number } | null;
}

export interface TauxOfficiel {
  date: string;
  refBrh: number;
  publieLe: { seconds: number; nanoseconds: number } | null;
}

export type StatutContribution = "AKTIF" | "SIYALE";

export interface TauxKontribisyon {
  achat: number;
  vente: number;
  vil: string;
  uid: string;
  kreyeLe: { seconds: number; nanoseconds: number } | null;
  votesFyab: number;
  statut: StatutContribution;
}

export interface TauxAgrege {
  date: string;
  vil: string;
  achatMwayen: number;
  venteMwayen: number;
  nbKontribisyon: number;
}

export interface PushToken {
  token: string;
  uid: string;
  bolet: boolean;
  tauxSeuil?: number;
}

export function idTirage(t: Pick<Tirage, "date" | "etat" | "moment">): string {
  return `${t.date}_${t.etat}_${t.moment}`;
}
