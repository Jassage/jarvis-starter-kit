import { z } from 'zod';

const modePaiementEnum = z.enum(['ESPECES', 'CARTE', 'VIREMENT', 'CHEQUE', 'MOBILE_MONEY', 'CREDIT', 'AUTRE']);

export const creerVenteSchema = z.object({
  body: z.object({
    clientId: z.string().optional(),
    lignes: z
      .array(
        z.object({
          produitId: z.string().min(1),
          quantite: z.coerce.number().int().positive('La quantité doit être positive'),
        })
      )
      .min(1, 'Au moins une ligne est requise'),
    remise: z.coerce.number().nonnegative().default(0),
    paiements: z
      .array(
        z.object({
          mode: modePaiementEnum,
          montant: z.coerce.number().positive(),
        })
      )
      .min(1, 'Au moins un paiement est requis'),
    ordonnanceId: z.string().optional(),
    ordonnance: z
      .object({
        medecinNom: z.string().min(1, 'Nom du médecin requis'),
        patientNom: z.string().min(1, 'Nom du patient requis'),
        patientTelephone: z.string().optional(),
        dateEmission: z.coerce.date(),
      })
      .optional(),
  }),
});

export const annulerVenteSchema = z.object({
  body: z.object({
    motif: z.string().min(1, "Le motif de l'annulation est requis"),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listVentesQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(200).default(50),
    clientId: z.string().optional(),
    statut: z.enum(['COMPLETEE', 'ANNULEE']).optional(),
  }),
});
