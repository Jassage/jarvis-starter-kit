import { prisma } from "../lib/prisma";
import { ReportReason } from "@prisma/client";

export const reportUserService = async (
  reporterId: string,
  reportedId: string,
  reason: ReportReason,
  description?: string
) => {
  if (reporterId === reportedId) throw new Error("Action invalide");

  const reported = await prisma.user.findUnique({ where: { id: reportedId } });
  if (!reported) throw new Error("Utilisateur introuvable");

  const existing = await prisma.report.findFirst({ where: { reporterId, reportedId } });
  if (existing) throw new Error("Vous avez déjà signalé cet utilisateur");

  return prisma.report.create({ data: { reporterId, reportedId, reason, description } });
};

export const blockUserService = async (blockerId: string, blockedId: string) => {
  if (blockerId === blockedId) throw new Error("Action invalide");

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    update: {},
    create: { blockerId, blockedId },
  });

  const [userAId, userBId] = [blockerId, blockedId].sort();
  await prisma.match.updateMany({
    where: { userAId, userBId },
    data: { isActive: false },
  });
};

export const unblockUserService = async (blockerId: string, blockedId: string) => {
  await prisma.block.deleteMany({ where: { blockerId, blockedId } });
};

export const getBlockedUsersService = async (userId: string) => {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: {
      blocked: {
        include: {
          profile: { select: { firstName: true, city: true } },
          photos: { where: { isMain: true }, select: { url: true } },
        },
      },
    },
  });

  return blocks.map((b) => ({
    userId: b.blockedId,
    firstName: b.blocked.profile?.firstName,
    city: b.blocked.profile?.city,
    photo: b.blocked.photos[0]?.url ?? null,
    blockedAt: b.createdAt,
  }));
};
