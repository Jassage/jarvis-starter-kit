import crypto from 'crypto';
import { Prisma, PropertyType, ListingType, Department, Currency } from '@prisma/client';
import prisma from '../../config/database';
import { paginate, parsePagination } from '../../utils/response';
import redis from '../../config/redis';

const SEARCH_CACHE_TTL = 300; // 5 minutes

function buildCacheKey(filters: SearchFilters, rawQuery: Record<string, string>): string {
  const payload = JSON.stringify({ filters, page: rawQuery.page, limit: rawQuery.limit });
  // Hash complet : déterministe et sans collision (le slice base64 pouvait en créer)
  const hash = crypto.createHash('sha1').update(payload).digest('hex');
  return `lakay:search:${hash}`;
}

export interface SearchFilters {
  q?: string;
  listingType?: ListingType;
  propertyType?: PropertyType | PropertyType[];
  department?: Department;
  commune?: string;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  bedrooms?: number;
  minBedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;

  // Équipements
  hasWater?: boolean;
  hasElectricity?: boolean;
  hasGenerator?: boolean;
  hasSolarPanel?: boolean;
  hasCistern?: boolean;
  hasInternet?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  hasAC?: boolean;
  isFurnished?: boolean;
  petsAllowed?: boolean;
  hasSecurity?: boolean;
  hasSeaView?: boolean;
  isAvailableNow?: boolean;

  // Géo
  lat?: number;
  lng?: number;
  radiusKm?: number;

  isFeatured?: boolean;

  // Sort
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'views' | 'relevance';
}

const LISTING_CARD_SELECT = {
  id: true,
  title: true,
  propertyType: true,
  listingType: true,
  price: true,
  currency: true,
  priceNegotiable: true,
  department: true,
  commune: true,
  city: true,
  neighborhood: true,
  landmark: true,
  latitude: true,
  longitude: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  hasWater: true,
  hasElectricity: true,
  hasGenerator: true,
  isFurnished: true,
  hasSecurity: true,
  hasSeaView: true,
  isAvailableNow: true,
  isFeatured: true,
  isSponsored: true,
  viewCount: true,
  favoriteCount: true,
  createdAt: true,
  images: {
    where: { isPrimary: true },
    select: { url: true, alt: true },
    take: 1,
  },
  owner: { select: { id: true, firstName: true, lastName: true, avatar: true, isVerified: true } },
  agency: { select: { id: true, name: true, logo: true, isVerified: true } },
};

export async function search(filters: SearchFilters, rawQuery: Record<string, string>) {
  const { page, limit, skip } = parsePagination(rawQuery);

  // Cache Redis — lecture (fault-tolerant : si Redis est KO, on continue sans cache)
  const cacheKey = buildCacheKey(filters, rawQuery);
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* Redis indisponible, on continue */ }

  const where: Prisma.ListingWhereInput = {
    status: 'ACTIVE',
    expiresAt: { gt: new Date() },
  };

  // Recherche texte
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
      { city: { contains: filters.q, mode: 'insensitive' } },
      { neighborhood: { contains: filters.q, mode: 'insensitive' } },
      { commune: { contains: filters.q, mode: 'insensitive' } },
      { landmark: { contains: filters.q, mode: 'insensitive' } },
    ];
  }

  if (filters.listingType) where.listingType = filters.listingType;

  if (filters.propertyType) {
    where.propertyType = Array.isArray(filters.propertyType)
      ? { in: filters.propertyType }
      : filters.propertyType;
  }

  if (filters.department) where.department = filters.department;
  if (filters.commune) where.commune = { contains: filters.commune, mode: 'insensitive' };
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
  if (filters.neighborhood) where.neighborhood = { contains: filters.neighborhood, mode: 'insensitive' };

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price = { ...where.price as object, gte: filters.minPrice };
    if (filters.maxPrice) where.price = { ...where.price as object, lte: filters.maxPrice };
  }
  if (filters.currency) where.currency = filters.currency;

  if (filters.minBedrooms) where.bedrooms = { gte: filters.minBedrooms };
  else if (filters.bedrooms) where.bedrooms = { gte: filters.bedrooms };

  if (filters.minArea) where.area = { gte: filters.minArea };
  if (filters.maxArea) where.area = { ...(where.area as object || {}), lte: filters.maxArea };

  // Équipements boolean
  const booleanFilters = [
    'hasWater', 'hasElectricity', 'hasGenerator', 'hasSolarPanel', 'hasCistern',
    'hasInternet', 'hasParking', 'hasPool', 'hasAC', 'isFurnished',
    'petsAllowed', 'hasSecurity', 'hasSeaView', 'isAvailableNow',
  ] as const;

  for (const f of booleanFilters) {
    if (filters[f] === true) (where as Record<string, unknown>)[f] = true;
  }

  if (filters.isFeatured) where.isFeatured = true;

  // Filtrage géographique via bounding box (dans le WHERE → pagination & total corrects).
  // On approxime le cercle par un carré ; le raffinage Haversine exact se fait ensuite sur la page.
  if (filters.lat != null && filters.lng != null && filters.radiusKm) {
    const latDelta = filters.radiusKm / 111.32;
    const lngDelta = filters.radiusKm / (111.32 * Math.cos(toRad(filters.lat)) || 1);
    where.latitude = { gte: filters.lat - latDelta, lte: filters.lat + latDelta };
    where.longitude = { gte: filters.lng - lngDelta, lte: filters.lng + lngDelta };
  }

  // Tri
  let orderBy: Prisma.ListingOrderByWithRelationInput[] = [];
  // Sponsorisés toujours en premier
  orderBy.push({ isSponsored: 'desc' }, { isFeatured: 'desc' });

  switch (filters.sortBy) {
    case 'price_asc': orderBy.push({ price: 'asc' }); break;
    case 'price_desc': orderBy.push({ price: 'desc' }); break;
    case 'date_asc': orderBy.push({ createdAt: 'asc' }); break;
    case 'views': orderBy.push({ viewCount: 'desc' }); break;
    default: orderBy.push({ createdAt: 'desc' });
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({ where, select: LISTING_CARD_SELECT, orderBy, skip, take: limit }),
    prisma.listing.count({ where }),
  ]);

  // Raffinage Haversine sur la page pour retirer les coins du carré (bounding box → cercle).
  // Purement cosmétique : la pagination reste pilotée par le total de la bounding box.
  let filteredListings = listings;
  if (filters.lat != null && filters.lng != null && filters.radiusKm) {
    filteredListings = listings
      .map((l) => ({
        listing: l,
        distanceKm: l.latitude != null && l.longitude != null
          ? haversineKm(filters.lat!, filters.lng!, Number(l.latitude), Number(l.longitude))
          : null,
      }))
      .filter((x) => x.distanceKm == null || x.distanceKm <= filters.radiusKm!)
      .map((x) => ({ ...x.listing, distanceKm: x.distanceKm }));
  }

  const result = {
    listings: filteredListings,
    pagination: paginate(page, limit, total),
    appliedFilters: filters,
  };

  // Cache Redis — écriture (fault-tolerant)
  try {
    await redis.setex(cacheKey, SEARCH_CACHE_TTL, JSON.stringify(result));
  } catch { /* Redis indisponible, on continue */ }

  return result;
}

// Distance Haversine en km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function toRad(deg: number) { return (deg * Math.PI) / 180; }

export async function autocomplete(q: string) {
  if (!q || q.length < 2) return [];

  const [cities, neighborhoods, communes] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'ACTIVE', city: { contains: q, mode: 'insensitive' } },
      select: { city: true, department: true },
      distinct: ['city'],
      take: 5,
    }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE', neighborhood: { contains: q, mode: 'insensitive' } },
      select: { neighborhood: true, city: true, department: true },
      distinct: ['neighborhood'],
      take: 5,
    }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE', commune: { contains: q, mode: 'insensitive' } },
      select: { commune: true, department: true },
      distinct: ['commune'],
      take: 5,
    }),
  ]);

  return [
    ...cities.map((c) => ({ type: 'city', label: c.city, department: c.department })),
    ...neighborhoods
      .filter((n) => n.neighborhood)
      .map((n) => ({ type: 'neighborhood', label: `${n.neighborhood}, ${n.city}`, department: n.department })),
    ...communes.map((c) => ({ type: 'commune', label: c.commune, department: c.department })),
  ].slice(0, 10);
}

export async function getStats() {
  const [totalActive, byType, byDepartment, recent] = await Promise.all([
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.groupBy({
      by: ['propertyType'],
      where: { status: 'ACTIVE' },
      _count: true,
    }),
    prisma.listing.groupBy({
      by: ['department'],
      where: { status: 'ACTIVE' },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.listing.count({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return { totalActive, byType, byDepartment, recentThisWeek: recent };
}
