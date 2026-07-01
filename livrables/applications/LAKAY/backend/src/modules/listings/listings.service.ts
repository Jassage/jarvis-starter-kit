import { Prisma, ListingStatus, UserRole } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary';
import { sendEmail, listingApprovedTemplate } from '../../utils/email';
import { getIO } from '../../config/socket';
import { paginate, parsePagination } from '../../utils/response';
import { notificationQueue } from '../../queues';

const LISTING_SELECT = {
  id: true,
  title: true,
  description: true,
  propertyType: true,
  listingType: true,
  price: true,
  currency: true,
  priceNegotiable: true,
  department: true,
  commune: true,
  city: true,
  neighborhood: true,
  address: true,
  landmark: true,
  latitude: true,
  longitude: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  floor: true,
  hasWater: true,
  hasElectricity: true,
  hasGenerator: true,
  hasSolarPanel: true,
  hasCistern: true,
  hasInternet: true,
  hasParking: true,
  hasPool: true,
  hasAC: true,
  isFurnished: true,
  petsAllowed: true,
  hasSecurity: true,
  hasSeaView: true,
  isAvailableNow: true,
  hasBalcony: true,
  hasGarden: true,
  virtualTourUrl: true,
  status: true,
  isFeatured: true,
  isSponsored: true,
  viewCount: true,
  contactCount: true,
  favoriteCount: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
  images: { orderBy: { order: 'asc' as const }, select: { id: true, url: true, alt: true, order: true, isPrimary: true } },
  owner: { select: { id: true, firstName: true, lastName: true, avatar: true, phone: true, whatsapp: true, isVerified: true } },
  agency: { select: { id: true, name: true, logo: true, phone: true, isVerified: true } },
  _count: { select: { favorites: true, reviews: true } },
};

export async function createListing(ownerId: string, data: Record<string, unknown>) {
  // Vérifier limites abonnement
  const subscription = await prisma.subscription.findUnique({ where: { userId: ownerId } });
  const limits = { FREE: 3, BASIC: 20, PROFESSIONAL: 999, ENTERPRISE: 9999 };
  const plan = subscription?.plan || 'FREE';
  const max = limits[plan];

  const activeCount = await prisma.listing.count({
    where: { ownerId, status: { in: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE'] } },
  });

  if (activeCount >= max) {
    throw new AppError(`Limite atteinte pour le plan ${plan} (${max} annonces). Passez à un plan supérieur.`, 403);
  }

  const expiresAt = new Date();
  const expiryDays = { FREE: 60, BASIC: 90, PROFESSIONAL: 180, ENTERPRISE: 365 };
  expiresAt.setDate(expiresAt.getDate() + expiryDays[plan]);

  return prisma.listing.create({
    data: { ...data, ownerId, expiresAt } as unknown as Prisma.ListingCreateInput,
    select: LISTING_SELECT,
  });
}

export async function updateListing(id: string, userId: string, userRole: string, data: Record<string, unknown>) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) throw new AppError('Annonce non trouvée', 404);

  const isOwner = listing.ownerId === userId;
  const isAdminUser = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  if (!isOwner && !isAdminUser) throw new AppError('Permission refusée', 403);

  // Propriétaire ne peut modifier qu'en DRAFT
  if (isOwner && !isAdminUser && listing.status !== 'DRAFT') {
    throw new AppError('Vous ne pouvez modifier une annonce qu\'en brouillon', 400);
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: data as Prisma.ListingUpdateInput,
    select: LISTING_SELECT,
  });

  // Alertes baisse de prix pour les utilisateurs qui ont mis en favori
  const newPrice = typeof data.price === 'number' ? data.price : null;
  if (newPrice !== null && Number(listing.price) > newPrice) {
    const drop = Math.round(((Number(listing.price) - newPrice) / Number(listing.price)) * 100);
    const favorites = await prisma.favorite.findMany({
      where: { listingId: id },
      select: { userId: true },
    });

    if (favorites.length > 0) {
      const jobs = favorites.map((fav) => ({
        name: 'price-drop',
        data: {
          userId: fav.userId,
          type: 'PRICE_DROP',
          title: 'Prix en baisse !',
          message: `"${listing.title}" a baissé de ${drop}%. Nouveau prix : ${newPrice.toLocaleString()} ${listing.currency}.`,
          link: `/properties/${id}`,
          data: { listingId: id, oldPrice: Number(listing.price), newPrice, drop },
        },
      }));
      await notificationQueue.addBulk(jobs);

      // Mettre à jour savedPrice pour refléter le nouveau prix
      await prisma.favorite.updateMany({
        where: { listingId: id },
        data: { savedPrice: newPrice },
      });
    }
  }

  return updated;
}

export async function deleteListing(id: string, userId: string, userRole: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) throw new AppError('Annonce non trouvée', 404);

  const isOwner = listing.ownerId === userId;
  const isAdminUser = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  if (!isOwner && !isAdminUser) throw new AppError('Permission refusée', 403);

  await prisma.listing.delete({ where: { id } });
}

export async function getListingById(id: string, userId?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      ...LISTING_SELECT,
      videos: { select: { id: true, url: true, thumbnail: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      },
    },
  });

  if (!listing) throw new AppError('Annonce non trouvée', 404);

  // Incrémenter le compteur de vues
  await prisma.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  // Vérifier si l'utilisateur a mis en favori
  let isFavorite = false;
  if (userId) {
    const fav = await prisma.favorite.findUnique({ where: { userId_listingId: { userId, listingId: id } } });
    isFavorite = !!fav;
  }

  return { ...listing, isFavorite };
}

export async function getMyListings(userId: string, query: Record<string, string>) {
  const { page, limit, skip } = parsePagination(query);
  const status = query.status as ListingStatus | undefined;

  const where: Prisma.ListingWhereInput = {
    ownerId: userId,
    ...(status && { status }),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: LISTING_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, pagination: paginate(page, limit, total) };
}

export async function submitForReview(id: string, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!listing) throw new AppError('Annonce non trouvée', 404);
  if (listing.ownerId !== userId) throw new AppError('Permission refusée', 403);
  if (listing.status !== 'DRAFT') throw new AppError('L\'annonce doit être en brouillon', 400);
  if (listing.images.length === 0) throw new AppError('Au moins une photo est requise', 400);
  if (!listing.landmark && (!listing.latitude || !listing.longitude)) {
    throw new AppError('Un point de repère ou des coordonnées GPS sont requis', 400);
  }

  return prisma.listing.update({
    where: { id },
    data: { status: 'PENDING_REVIEW' },
    select: LISTING_SELECT,
  });
}

export async function reviewListing(id: string, adminId: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { email: true, firstName: true } } },
  });
  if (!listing) throw new AppError('Annonce non trouvée', 404);
  if (listing.status !== 'PENDING_REVIEW') throw new AppError('Annonce non soumise à review', 400);

  const status: ListingStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';

  const updated = await prisma.listing.update({
    where: { id },
    data: { status, rejectionReason, reviewedAt: new Date(), reviewedById: adminId },
    select: LISTING_SELECT,
  });

  // Notification temps réel
  try {
    const io = getIO();
    io.to(`user:${listing.ownerId}`).emit('listing_reviewed', { listingId: id, status });
  } catch { /* Socket non disponible */ }

  // Email
  if (action === 'APPROVE') {
    await sendEmail({
      to: listing.owner.email,
      subject: '✅ Annonce approuvée — LAKAY',
      html: listingApprovedTemplate(listing.owner.firstName, listing.title, id),
    });
  }

  // Notification DB
  await prisma.notification.create({
    data: {
      userId: listing.ownerId,
      type: action === 'APPROVE' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      title: action === 'APPROVE' ? 'Annonce approuvée' : 'Annonce rejetée',
      message: action === 'APPROVE'
        ? `Votre annonce "${listing.title}" est maintenant en ligne.`
        : `Votre annonce "${listing.title}" a été rejetée. Motif: ${rejectionReason}`,
      data: { listingId: id },
      link: `/properties/${id}`,
    },
  });

  return updated;
}

export async function uploadListingImages(listingId: string, userId: string, files: Express.Multer.File[]) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError('Annonce non trouvée', 404);
  if (listing.ownerId !== userId) throw new AppError('Permission refusée', 403);

  const existingCount = await prisma.listingImage.count({ where: { listingId } });
  const maxImages = 20;
  if (existingCount + files.length > maxImages) {
    throw new AppError(`Maximum ${maxImages} images par annonce`, 400);
  }

  const uploadPromises = files.map(async (file, index) => {
    const { url, publicId, width, height } = await uploadToCloudinary(file.buffer, `listings/${listingId}`, {
      transformation: [{ width: 1280, height: 960, crop: 'limit', quality: 85 }],
    });
    return prisma.listingImage.create({
      data: {
        listingId,
        url,
        publicId,
        width,
        height,
        order: existingCount + index,
        isPrimary: existingCount === 0 && index === 0,
      },
    });
  });

  return Promise.all(uploadPromises);
}

export async function deleteListingImage(imageId: string, userId: string) {
  const image = await prisma.listingImage.findUnique({
    where: { id: imageId },
    include: { listing: { select: { ownerId: true } } },
  });
  if (!image) throw new AppError('Image non trouvée', 404);
  if (image.listing.ownerId !== userId) throw new AppError('Permission refusée', 403);

  if (image.publicId) await deleteFromCloudinary(image.publicId);
  await prisma.listingImage.delete({ where: { id: imageId } });
}

export async function getFeaturedListings() {
  return prisma.listing.findMany({
    where: { status: 'ACTIVE', isFeatured: true },
    select: LISTING_SELECT,
    orderBy: [{ isSponsored: 'desc' }, { createdAt: 'desc' }],
    take: 12,
  });
}

export async function renewListing(id: string, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { id: true, subscription: { select: { plan: true } } } } },
  });
  if (!listing) throw new AppError('Annonce non trouvée', 404);
  if (listing.ownerId !== userId) throw new AppError('Permission refusée', 403);
  if (!['ACTIVE', 'EXPIRED'].includes(listing.status)) {
    throw new AppError('Seules les annonces actives ou expirées peuvent être renouvelées', 400);
  }

  const plan = listing.owner.subscription?.plan ?? 'FREE';
  const expiryDays = { FREE: 30, BASIC: 90, PROFESSIONAL: 180, ENTERPRISE: 365 } as const;
  const days = expiryDays[plan as keyof typeof expiryDays] ?? 30;

  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + days);

  return prisma.listing.update({
    where: { id },
    data: {
      expiresAt: newExpiry,
      status: listing.status === 'EXPIRED' ? 'ACTIVE' : listing.status,
    },
    select: LISTING_SELECT,
  });
}

export async function getSimilarListings(currentId: string) {
  const current = await prisma.listing.findUnique({
    where: { id: currentId },
    select: { propertyType: true, department: true, listingType: true },
  });
  if (!current) return [];

  const SIMILAR_SELECT = {
    id: true,
    title: true,
    propertyType: true,
    listingType: true,
    price: true,
    currency: true,
    priceNegotiable: true,
    city: true,
    neighborhood: true,
    department: true,
    landmark: true,
    bedrooms: true,
    bathrooms: true,
    area: true,
    hasElectricity: true,
    hasWater: true,
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

  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: currentId },
      propertyType: current.propertyType,
      listingType: current.listingType,
      department: current.department,
      expiresAt: { gt: new Date() },
    },
    select: SIMILAR_SELECT,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 4,
  });

  // Fallback : si moins de 2 similaires dans le même département, élargir à tout le pays
  if (listings.length < 2) {
    const broader = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: currentId, notIn: listings.map((l) => l.id) },
        propertyType: current.propertyType,
        listingType: current.listingType,
        expiresAt: { gt: new Date() },
      },
      select: SIMILAR_SELECT,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 4 - listings.length,
    });
    return [...listings, ...broader];
  }

  return listings;
}

export async function getPendingListings(query: Record<string, string>) {
  const { page, limit, skip } = parsePagination(query);
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'PENDING_REVIEW' },
      select: { ...LISTING_SELECT, rejectionReason: true },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where: { status: 'PENDING_REVIEW' } }),
  ]);
  return { listings, pagination: paginate(page, limit, total) };
}
