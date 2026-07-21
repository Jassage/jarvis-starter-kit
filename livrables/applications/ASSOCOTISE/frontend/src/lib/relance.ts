import { formatMoisLabel, formatMontant } from './format';

/**
 * Met un numéro au format attendu par wa.me : chiffres uniquement, indicatif pays inclus.
 * Les numéros sont saisis librement dans la fiche membre (« +509 3700 1000 », « 37001000 »,
 * « 509-3700-1000 »), d'où la normalisation. Un numéro déjà préfixé de son indicatif est
 * laissé tel quel ; un numéro purement local se voit ajouter l'indicatif de l'association.
 */
export function normaliserTelephone(telephone: string, indicatifPays: string): string | null {
  const chiffres = telephone.replace(/\D/g, '');
  if (chiffres.length < 6) return null;
  if (chiffres.startsWith(indicatifPays) && chiffres.length > indicatifPays.length) return chiffres;
  return `${indicatifPays}${chiffres}`;
}

/** Remplace les variables du modèle de message. Une variable inconnue est laissée telle quelle. */
export function construireMessageRelance(
  modele: string,
  valeurs: { nom: string; mois: string; montant: number; association: string }
): string {
  return modele
    .replaceAll('{nom}', valeurs.nom)
    .replaceAll('{mois}', formatMoisLabel(valeurs.mois))
    .replaceAll('{montant}', formatMontant(valeurs.montant))
    .replaceAll('{association}', valeurs.association);
}

export function lienWhatsApp(telephone: string, message: string): string {
  return `https://wa.me/${telephone}?text=${encodeURIComponent(message)}`;
}

export function lienEmail(email: string, sujet: string, message: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(message)}`;
}
