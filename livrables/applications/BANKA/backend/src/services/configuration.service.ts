import prisma from '../utils/prisma';

export const DEFAULTS: Record<string, { valeur: string; description: string }> = {
  NOM_INSTITUTION:           { valeur: 'BANKA',  description: 'Nom de l\'institution financière' },
  ADRESSE_INSTITUTION:       { valeur: '',        description: 'Adresse du siège social' },
  TELEPHONE_INSTITUTION:     { valeur: '',        description: 'Numéro de téléphone principal' },
  EMAIL_INSTITUTION:         { valeur: '',        description: 'Adresse email de contact' },
  TAUX_PENALITE_JOURNALIER:    { valeur: '0.001',  description: 'Taux de pénalité de retard journalier (0.001 = 0,1 %/jour)' },
  DELAI_GRACE_RETARD:          { valeur: '5',      description: 'Jours de grâce avant calcul des pénalités' },
  TAUX_INTERET_EPARGNE:        { valeur: '0.03',   description: 'Taux d\'intérêt annuel — Épargne classique' },
  TAUX_INTERET_TERME:          { valeur: '0.05',   description: 'Taux d\'intérêt annuel — Compte à terme' },
  TAUX_INTERET_MICRO_EPARGNE:  { valeur: '0.02',   description: 'Taux d\'intérêt annuel — Micro-épargne' },
  TAUX_INTERET_RETRAITE:       { valeur: '0.04',   description: 'Taux d\'intérêt annuel — Retraite' },
  TAUX_INTERET_JEUNESSE:       { valeur: '0.02',   description: 'Taux d\'intérêt annuel — Compte jeunesse' },
  TAUX_INTERET_TONTINE:        { valeur: '0',      description: 'Taux d\'intérêt annuel — Tontine' },
  TAUX_DEFAULT_PRET_MENSUEL:   { valeur: '0.03',   description: 'Taux mensuel par défaut pour les nouveaux prêts (0.03 = 3 %/mois)' },
  SOLDE_MINIMUM_OUVERTURE:     { valeur: '500',    description: 'Solde minimum requis à l\'ouverture d\'un compte (HTG)' },
  PLAFOND_RETRAIT_JOURNALIER:  { valeur: '100000', description: 'Plafond de retrait journalier par compte (HTG)' },
  DEVISE_PRINCIPALE:           { valeur: 'HTG',    description: 'Devise principale de l\'institution' },
  // Frais
  FRAIS_OUVERTURE_COMPTE:      { valeur: '0',      description: 'Frais fixes prélevés à l\'ouverture d\'un compte en HTG (0 = désactivé)' },
  FRAIS_TENUE_COMPTE_MENSUEL:  { valeur: '0',      description: 'Frais de tenue de compte mensuel en HTG (0 = désactivé)' },
  FRAIS_DOSSIER_PRET_TAUX:     { valeur: '0',      description: 'Frais de dossier prêt en % du montant décaissé (0 = désactivé, ex : 2 pour 2%)' },
  FRAIS_VIREMENT_TAUX:         { valeur: '0',      description: 'Frais de virement en % du montant (0 = désactivé, ex : 0.5 pour 0,5%)' },
  // Seuils AML (BRH)
  AML_SEUIL_HTG:               { valeur: '500000', description: 'Seuil de déclaration obligatoire BRH en HTG' },
  AML_SEUIL_USD:               { valeur: '10000',  description: 'Seuil de déclaration obligatoire BRH en USD' },
};

export async function getAllConfigs() {
  const stored = await prisma.configuration.findMany({ orderBy: { cle: 'asc' } });
  const storedMap = Object.fromEntries(stored.map((c) => [c.cle, c]));

  return Object.entries(DEFAULTS).map(([cle, def]) => ({
    cle,
    valeur: storedMap[cle]?.valeur ?? def.valeur,
    description: storedMap[cle]?.description ?? def.description,
    updatedAt: storedMap[cle]?.updatedAt ?? null,
  }));
}

export async function getConfig(cle: string): Promise<string> {
  const cfg = await prisma.configuration.findUnique({ where: { cle } });
  return cfg?.valeur ?? DEFAULTS[cle]?.valeur ?? '';
}

export async function upsertConfig(cle: string, valeur: string) {
  return prisma.configuration.upsert({
    where: { cle },
    update: { valeur },
    create: { cle, valeur, description: DEFAULTS[cle]?.description ?? '' },
  });
}

export async function bulkUpsert(entries: { cle: string; valeur: string }[]) {
  return Promise.all(entries.map((e) => upsertConfig(e.cle, e.valeur)));
}
