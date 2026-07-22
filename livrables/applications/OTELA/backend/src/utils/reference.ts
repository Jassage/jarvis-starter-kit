import { randomInt } from 'crypto';

// Référence de réservation lisible et communicable oralement : préfixe OT- suivi de
// 6 caractères d'un alphabet sans I/O/0/1 (évite les confusions à l'épellation ou
// à la saisie). ~30^6 ≈ 730 millions de combinaisons, largement suffisant, avec
// une reprise en cas de collision côté service (contrainte unique en base).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function genererReference(): string {
  let code = '';
  for (let i = 0; i < 6; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `OT-${code}`;
}
