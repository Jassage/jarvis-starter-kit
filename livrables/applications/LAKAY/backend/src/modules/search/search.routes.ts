import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { searchLimiter } from '../../middlewares/rateLimiter.middleware';
import { sendSuccess } from '../../utils/response';
import * as searchService from './search.service';
import type { SearchFilters } from './search.service';

const router = Router();

router.get('/', searchLimiter, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string>;

  const filters: SearchFilters = {
    q: query.q,
    listingType: query.listingType as SearchFilters['listingType'],
    propertyType: query.propertyType as SearchFilters['propertyType'],
    department: query.department as SearchFilters['department'],
    commune: query.commune,
    city: query.city,
    neighborhood: query.neighborhood,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    currency: query.currency as SearchFilters['currency'],
    minBedrooms: query.minBedrooms ? Number(query.minBedrooms) : undefined,
    bedrooms: query.bedrooms ? Number(query.bedrooms) : undefined,
    minArea: query.minArea ? Number(query.minArea) : undefined,
    maxArea: query.maxArea ? Number(query.maxArea) : undefined,

    hasWater: query.hasWater === 'true',
    hasElectricity: query.hasElectricity === 'true',
    hasGenerator: query.hasGenerator === 'true',
    hasSolarPanel: query.hasSolarPanel === 'true',
    hasCistern: query.hasCistern === 'true',
    hasInternet: query.hasInternet === 'true',
    hasParking: query.hasParking === 'true',
    hasPool: query.hasPool === 'true',
    hasAC: query.hasAC === 'true',
    isFurnished: query.isFurnished === 'true',
    petsAllowed: query.petsAllowed === 'true',
    hasSecurity: query.hasSecurity === 'true',
    hasSeaView: query.hasSeaView === 'true',
    isAvailableNow: query.isAvailableNow === 'true',

    lat: query.lat ? Number(query.lat) : undefined,
    lng: query.lng ? Number(query.lng) : undefined,
    radiusKm: query.radiusKm ? Number(query.radiusKm) : undefined,

    isFeatured: query.isFeatured === 'true',
    sortBy: query.sortBy as SearchFilters['sortBy'],
  };

  const result = await searchService.search(filters, query);
  sendSuccess(res, result.listings, 'Résultats', 200, { pagination: result.pagination, filters: result.appliedFilters });
}));

router.get('/autocomplete', asyncHandler(async (req, res) => {
  const results = await searchService.autocomplete(req.query.q as string);
  sendSuccess(res, results);
}));

router.get('/stats', asyncHandler(async (_req, res) => {
  const stats = await searchService.getStats();
  sendSuccess(res, stats);
}));

export default router;
