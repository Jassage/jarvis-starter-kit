// Génère un numéro séquentiel lisible du type PREFIX-000123 à partir d'un compteur
// (le dernier numéro existant, ou 0). Utilisé pour commandes d'achat, ventes, ordonnances.
export function genererNumero(prefixe: string, dernierNumero: number): string {
  return `${prefixe}-${String(dernierNumero + 1).padStart(6, '0')}`;
}
