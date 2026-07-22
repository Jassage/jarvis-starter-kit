import { z } from 'zod';

const deviseEnum = z.enum(['HTG', 'USD']);

// "HH:mm" en 24 h — les heures de check-in/out sont des libellés d'affichage, pas
// des instants (cf. le commentaire fuseauHoraire du schema Prisma).
const heure = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format attendu HH:mm');

// Fiche publique de l'établissement. Tous ces champs sont optionnels : un
// établissement reste valide sans logo ni GPS, la fiche se remplit progressivement.
const ficheFields = {
  logoUrl: z.string().url().nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  telephone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  siteWeb: z.string().url().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  equipements: z.array(z.string().min(1).max(100)).optional(),
  heureCheckIn: heure.optional(),
  heureCheckOut: heure.optional(),
  politiqueAnnulation: z.string().max(5000).nullable().optional(),
  devisePrincipale: deviseEnum.optional(),
  fuseauHoraire: z.string().min(1).max(100).optional(),
};

export const createEtablissementSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(150),
    adresse: z.string().min(2).max(255),
    commune: z.string().min(2).max(100),
    departement: z.string().min(2).max(100),
    devisesAcceptees: z.array(deviseEnum).min(1),
    ...ficheFields,
  }),
});

export const updateEtablissementSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(150).optional(),
    adresse: z.string().min(2).max(255).optional(),
    commune: z.string().min(2).max(100).optional(),
    departement: z.string().min(2).max(100).optional(),
    devisesAcceptees: z.array(deviseEnum).min(1).optional(),
    actif: z.boolean().optional(),
    ...ficheFields,
  }),
});
