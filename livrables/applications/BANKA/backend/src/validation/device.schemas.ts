import { z } from 'zod';

export const createDeviceSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(150).trim(),
  serialNumber: z.string().min(1, 'Numéro de série requis').max(100).trim(),
  commKey: z.string().max(100),
});

export const updateDeviceSchema = z.object({
  nom: z.string().min(1).max(150).trim().optional(),
  commKey: z.string().max(100).optional(),
  actif: z.boolean().optional(),
});
