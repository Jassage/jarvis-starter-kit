import { z } from 'zod';

const listingBodySchema = z.object({
  title: z.string().min(10, 'Titre trop court').max(200),
  description: z.string().min(50, 'Description trop courte (min 50 caractères)').max(5000),
  propertyType: z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'COMMERCIAL', 'OFFICE', 'WAREHOUSE']),
  listingType: z.enum(['RENT', 'SALE']),
  price: z.coerce.number().positive('Le prix doit être positif'),
  currency: z.enum(['HTG', 'USD']).default('HTG'),
  priceNegotiable: z.boolean().optional(),
  monthlyCharges: z.coerce.number().optional(),

  // Localisation
  department: z.enum(['OUEST', 'NORD', 'NORD_EST', 'NORD_OUEST', 'ARTIBONITE', 'CENTRE', 'SUD', 'SUD_EST', 'NIPPES', 'GRANDE_ANSE']),
  commune: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  neighborhood: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  landmark: z.string().max(500).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  googleMapsUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional().transform(v => v || undefined),

  // Détails
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().positive().optional(),
  floor: z.coerce.number().int().optional(),
  totalFloors: z.coerce.number().int().positive().optional(),
  yearBuilt: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  parkingSpaces: z.coerce.number().int().min(0).optional(),

  // Équipements
  hasWater: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasGenerator: z.boolean().optional(),
  hasSolarPanel: z.boolean().optional(),
  hasCistern: z.boolean().optional(),
  hasInternet: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasAC: z.boolean().optional(),
  isFurnished: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  hasSecurity: z.boolean().optional(),
  hasSeaView: z.boolean().optional(),
  hasMountainView: z.boolean().optional(),
  isAvailableNow: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasGarden: z.boolean().optional(),

  virtualTourUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional().transform(v => v || undefined),
  agencyId: z.string().optional(),
});

export const createListingSchema = z.object({
  body: listingBodySchema.refine(
    (data) => data.landmark || (data.latitude && data.longitude),
    { message: 'Un point de repère OU des coordonnées GPS sont requis' }
  ),
});

export const updateListingSchema = z.object({
  params: z.object({ id: z.string() }),
  body: listingBodySchema.partial(),
});

export const listingIdSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const submitListingSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const reviewListingSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    action: z.enum(['APPROVE', 'REJECT']),
    rejectionReason: z.string().optional(),
  }).refine(
    (d) => d.action !== 'REJECT' || !!d.rejectionReason,
    { message: 'Motif de rejet requis', path: ['rejectionReason'] }
  ),
});
