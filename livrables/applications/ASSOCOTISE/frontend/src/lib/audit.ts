import type { Cotisation, Depense, Membre, Relance, UtilisateurBureau } from '../types';

export type TypeEvenement =
  | 'cotisation_saisie'
  | 'cotisation_corrigee'
  | 'cotisation_annulee'
  | 'depense_creee'
  | 'depense_modifiee'
  | 'depense_annulee'
  | 'relance_envoyee'
  | 'compte_cree';

export interface EvenementAudit {
  id: string;
  date: string;
  type: TypeEvenement;
  auteurId: string;
  libelle: string;
  cible?: string;
  montant?: number;
}

export const LIBELLES_TYPE: Record<TypeEvenement, string> = {
  cotisation_saisie: 'Cotisation saisie',
  cotisation_corrigee: 'Cotisation corrigée',
  cotisation_annulee: 'Cotisation annulée',
  depense_creee: 'Dépense enregistrée',
  depense_modifiee: 'Dépense modifiée',
  depense_annulee: 'Dépense annulée',
  relance_envoyee: 'Relance envoyée',
  compte_cree: 'Compte du bureau créé',
};

/**
 * Construit le journal d'audit à partir des traces déjà portées par les documents
 * (`saisiPar`/`saisiLe`, `modifieLe`, `annuleePar`/`annuleeLe`, `envoyeePar`/`envoyeeLe`,
 * `creePar`/`creeLe`).
 *
 * Choix assumé : aucune collection de log séparée. Sans backend, un journal écrit par le
 * client pourrait tout simplement ne pas être écrit par qui voudrait dissimuler une action,
 * ce qui donnerait une fausse garantie. Dériver le journal des documents eux-mêmes le rend
 * exactement aussi fiable que les données qu'il décrit, ni plus ni moins.
 *
 * Limite connue : une dépense modifiée plusieurs fois ne conserve que sa dernière
 * modification (`modifieLe` est écrasé à chaque fois), là où les cotisations gardent tout
 * leur historique puisqu'une correction crée un nouveau document.
 */
export function construireJournal(sources: {
  cotisations: Cotisation[];
  depenses: Depense[];
  relances: Relance[];
  membres: Membre[];
  utilisateurs: UtilisateurBureau[];
}): EvenementAudit[] {
  const { cotisations, depenses, relances, membres, utilisateurs } = sources;
  const nomMembre = new Map(membres.map((m) => [m.id, m.nom]));
  const evenements: EvenementAudit[] = [];

  for (const c of cotisations) {
    evenements.push({
      id: `${c.id}-saisie`,
      date: c.saisiLe,
      type: c.corrige ? 'cotisation_corrigee' : 'cotisation_saisie',
      auteurId: c.saisiPar,
      libelle: `Cotisation ${c.mois}`,
      cible: nomMembre.get(c.memberId) ?? 'Membre supprimé',
      montant: c.montant,
    });
    if (c.annulee && c.annuleeLe) {
      evenements.push({
        id: `${c.id}-annulation`,
        date: c.annuleeLe,
        type: 'cotisation_annulee',
        auteurId: c.annuleePar ?? '',
        libelle: `Cotisation ${c.mois}`,
        cible: nomMembre.get(c.memberId) ?? 'Membre supprimé',
        montant: c.montant,
      });
    }
  }

  for (const d of depenses) {
    evenements.push({
      id: `${d.id}-creation`,
      date: d.saisiLe,
      type: 'depense_creee',
      auteurId: d.saisiPar,
      libelle: d.description,
      montant: d.montant,
    });
    if (d.modifieLe) {
      evenements.push({
        id: `${d.id}-modification`,
        date: d.modifieLe,
        type: 'depense_modifiee',
        auteurId: d.saisiPar,
        libelle: d.description,
        montant: d.montant,
      });
    }
    if (d.annulee && d.annuleeLe) {
      evenements.push({
        id: `${d.id}-annulation`,
        date: d.annuleeLe,
        type: 'depense_annulee',
        auteurId: d.annuleePar ?? '',
        libelle: d.description,
        montant: d.montant,
      });
    }
  }

  for (const r of relances) {
    evenements.push({
      id: `${r.id}-relance`,
      date: r.envoyeeLe,
      type: 'relance_envoyee',
      auteurId: r.envoyeePar,
      libelle: `Relance ${r.canal === 'whatsapp' ? 'WhatsApp' : 'email'} pour ${r.mois}`,
      cible: nomMembre.get(r.memberId) ?? 'Membre supprimé',
    });
  }

  for (const u of utilisateurs) {
    evenements.push({
      id: `${u.id}-compte`,
      date: u.creeLe,
      type: 'compte_cree',
      auteurId: u.creePar,
      libelle: `${u.nom} (${u.role === 'secretaire' ? 'secrétaire' : 'responsable finances'})`,
    });
  }

  return evenements.sort((a, b) => (a.date < b.date ? 1 : -1));
}
