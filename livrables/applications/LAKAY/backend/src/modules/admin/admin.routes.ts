import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../../middlewares/rbac.middleware';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';
import { parsePagination, paginate } from '../../utils/response';
import { ListingStatus, UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes admin nécessitent l'authentification
router.use(requireAuth);

// ─── Dashboard stats ───
router.get('/stats', requireAdmin, asyncHandler(async (_req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, activeUsers, newUsersThisMonth,
    totalListings, pendingListings, activeListings, expiredListings,
    viewsAggregate,
    totalAgencies, verifiedAgencies,
    totalReports, pendingReports,
    activeSubscriptions,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { status: 'EXPIRED' } }),
    prisma.listing.aggregate({ _sum: { viewCount: true } }),
    prisma.agency.count(),
    prisma.agency.count({ where: { isVerified: true } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.subscription.count({ where: { isActive: true } }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  sendSuccess(res, {
    users: {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
      agencies: totalAgencies,
    },
    listings: {
      total: totalListings,
      pending: pendingListings,
      active: activeListings,
      expired: expiredListings,
      totalViews: viewsAggregate._sum.viewCount ?? 0,
    },
    agencies: { total: totalAgencies, verified: verifiedAgencies },
    subscriptions: { active: activeSubscriptions },
    reports: { total: totalReports, open: pendingReports },
    recentActivity,
  });
}));

// ─── Utilisateurs ───
router.get('/users', requireAdmin, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string>;
  const { page, limit, skip } = parsePagination(query);
  const { role, q, isActive } = query;

  const where = {
    ...(role && { role: role as UserRole }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
    ...(q && { OR: [
      { firstName: { contains: q, mode: 'insensitive' as const } },
      { lastName: { contains: q, mode: 'insensitive' as const } },
      { email: { contains: q, mode: 'insensitive' as const } },
    ]}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, isVerified: true, createdAt: true,
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  sendSuccess(res, { users }, 'Utilisateurs', 200, { pagination: paginate(page, limit, total) });
}));

router.patch('/users/:id/toggle-active', requireAdmin, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return; }

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
    if (!u.isActive) await tx.refreshToken.deleteMany({ where: { userId: u.id } });
    return u;
  });

  sendSuccess(res, { user: updated }, `Compte ${updated.isActive ? 'activé' : 'désactivé'}`);
}));

router.patch('/users/:id/role', requireSuperAdmin, asyncHandler(async (req, res) => {
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: req.body.role as UserRole },
    select: { id: true, email: true, role: true },
  });
  sendSuccess(res, { user: updated }, 'Rôle modifié');
}));

// ─── Toutes les annonces ───
router.get('/listings', requireAdmin, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string>;
  const { page, limit, skip } = parsePagination(query);
  const { status, ownerId } = query;

  const where = {
    ...(status && { status: status as ListingStatus }),
    ...(ownerId && { ownerId }),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: {
        id: true, title: true, propertyType: true, listingType: true,
        price: true, currency: true, city: true, department: true,
        status: true, viewCount: true, createdAt: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { reports: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  sendSuccess(res, { listings }, 'Annonces', 200, { pagination: paginate(page, limit, total) });
}));

router.patch('/listings/:id/suspend', requireAdmin, asyncHandler(async (req, res) => {
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { status: 'SUSPENDED' },
    select: { id: true, status: true },
  });
  sendSuccess(res, { listing }, 'Annonce suspendue');
}));

// ─── Signalements ───
router.get('/reports', requireAdmin, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string>;
  const { page, limit, skip } = parsePagination(query);

  const where = query.status ? { status: query.status as 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED' } : {};

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        listing: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  sendSuccess(res, { reports }, 'Signalements', 200, { pagination: paginate(page, limit, total) });
}));

router.patch('/reports/:id', requireAdmin, asyncHandler(async (req, res) => {
  const report = await prisma.report.update({
    where: { id: req.params.id },
    data: {
      status: req.body.status,
      adminNote: req.body.adminNote,
      resolvedAt: ['RESOLVED', 'DISMISSED'].includes(req.body.status) ? new Date() : undefined,
      resolvedById: req.user!.id,
    },
  });
  sendSuccess(res, { report }, 'Signalement mis à jour');
}));

// ─── Configuration système ───
router.get('/config', requireAdmin, asyncHandler(async (_req, res) => {
  const configs = await prisma.systemConfig.findMany();
  sendSuccess(res, { configs });
}));

router.put('/config', requireSuperAdmin, asyncHandler(async (req, res) => {
  const { key, value, label } = req.body;
  const config = await prisma.systemConfig.upsert({
    where: { key },
    create: { key, value, label },
    update: { value, label },
  });
  sendSuccess(res, { config }, 'Configuration mise à jour');
}));

// ─── Audit log ───
router.get('/audit-logs', requireAdmin, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string>;
  const { page, limit, skip } = parsePagination(query);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  sendSuccess(res, { logs }, 'Audit log', 200, { pagination: paginate(page, limit, total) });
}));

export default router;
