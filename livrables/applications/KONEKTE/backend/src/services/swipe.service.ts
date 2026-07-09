import { prisma } from "../lib/prisma";
import { SwipeAction } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { sendPushNotification } from "./push.service";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SUPER_LIKE_DAILY_LIMIT = 3;

export const swipeService = async (
  senderId: string,
  receiverId: string,
  action: SwipeAction
) => {
  if (senderId === receiverId) throw new Error("Action invalide");

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver || !receiver.isActive || receiver.isBanned) {
    throw new Error("Utilisateur introuvable");
  }

  const existing = await prisma.swipe.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } },
  });
  if (existing) throw new Error("Déjà swipé sur ce profil");

  if (action === "SUPER_LIKE") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const usedToday = await prisma.swipe.count({
      where: { senderId, action: "SUPER_LIKE", createdAt: { gte: startOfDay } },
    });
    if (usedToday >= SUPER_LIKE_DAILY_LIMIT) {
      throw new Error("Quota de Super Likes atteint pour aujourd'hui");
    }
  }

  await prisma.swipe.create({ data: { senderId, receiverId, action } });

  let match = null;

  if (action === "LIKE" || action === "SUPER_LIKE") {
    const reverseSwipe = await prisma.swipe.findFirst({
      where: {
        senderId: receiverId,
        receiverId: senderId,
        action: { in: ["LIKE", "SUPER_LIKE"] },
      },
    });

    if (reverseSwipe) {
      const [userAId, userBId] = [senderId, receiverId].sort();

      match = await prisma.match.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        update: { isActive: true },
        create: {
          userAId,
          userBId,
          conversation: { create: {} },
        },
        include: {
          userA: { include: { profile: true, photos: { where: { isMain: true } } } },
          userB: { include: { profile: true, photos: { where: { isMain: true } } } },
        },
      });

      const senderBody = `Vous avez matché avec ${match.userB.profile?.firstName ?? "quelqu'un"}`;
      const receiverBody = `Vous avez matché avec ${match.userA.profile?.firstName ?? "quelqu'un"}`;

      await prisma.notification.createMany({
        data: [
          {
            userId: senderId,
            type: "NEW_MATCH",
            title: "Nouveau match !",
            body: senderBody,
            data: { matchId: match.id, userId: receiverId },
          },
          {
            userId: receiverId,
            type: "NEW_MATCH",
            title: "Nouveau match !",
            body: receiverBody,
            data: { matchId: match.id, userId: senderId },
          },
        ],
      });

      sendPushNotification(senderId, "Nouveau match !", senderBody, { type: "NEW_MATCH", matchId: match.id });
      sendPushNotification(receiverId, "Nouveau match !", receiverBody, { type: "NEW_MATCH", matchId: match.id });
    }
  }

  return { action, isMatch: !!match, match };
};

const BOOST_DURATION_MS = 30 * 60 * 1000;

export const activateBoostService = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { boostsRemaining: true } });
  if (!user || user.boostsRemaining <= 0) throw new Error("Aucun boost disponible");

  const boostedUntil = new Date(Date.now() + BOOST_DURATION_MS);

  // Compare-and-swap : évite qu'un double-tap ne consomme deux crédits pour
  // un seul boost (même pattern que le reste du portefeuille sur les
  // opérations qui décrémentent un compteur partagé).
  const claimed = await prisma.user.updateMany({
    where: { id: userId, boostsRemaining: { gt: 0 } },
    data: { boostsRemaining: { decrement: 1 }, isBoosted: true, boostedUntil },
  });
  if (claimed.count === 0) throw new Error("Aucun boost disponible");

  return { boostedUntil };
};

export const undoLastSwipeService = async (userId: string) => {
  const last = await prisma.swipe.findFirst({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
  });
  if (!last) throw new Error("Aucun swipe à annuler");

  await prisma.swipe.delete({ where: { id: last.id } });

  const profile = await prisma.profile.findUnique({
    where: { userId: last.receiverId },
    select: { firstName: true },
  });

  return { undoneUserId: last.receiverId, firstName: profile?.firstName };
};

export const unmatchService = async (userId: string, matchId: string) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { conversation: { include: { messages: true } } },
  });
  if (!match) throw new Error("Match introuvable");
  if (match.userAId !== userId && match.userBId !== userId) throw new Error("Accès refusé");

  if (match.conversation) {
    await prisma.message.deleteMany({ where: { conversationId: match.conversation.id } });
    await prisma.conversation.delete({ where: { id: match.conversation.id } });
  }
  await prisma.match.delete({ where: { id: matchId } });
};

export const getLikesReceivedService = async (userId: string) => {
  const viewer = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionPlan: true } });
  const isPremium = viewer?.subscriptionPlan !== "FREE";

  // IDs des utilisateurs avec qui on a déjà un match actif
  const existingMatches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }], isActive: true },
    select: { userAId: true, userBId: true },
  });
  const matchedUserIds = new Set(
    existingMatches.flatMap((m) => [m.userAId, m.userBId]).filter((id) => id !== userId)
  );

  const likes = await prisma.swipe.findMany({
    where: {
      receiverId: userId,
      action: { in: ["LIKE", "SUPER_LIKE"] },
      senderId: { notIn: Array.from(matchedUserIds) },
    },
    include: {
      sender: {
        include: {
          profile: { select: { firstName: true, city: true, birthDate: true } },
          photos: { where: { isMain: true }, select: { url: true, cloudinaryId: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return likes.map((l) => {
    const photo = l.sender.photos[0];

    if (isPremium) {
      return {
        swipeId: l.id,
        action: l.action,
        createdAt: l.createdAt,
        user: {
          id: l.sender.id,
          firstName: l.sender.profile?.firstName ?? "?",
          age: l.sender.profile?.birthDate
            ? Math.floor((Date.now() - l.sender.profile.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null,
          city: l.sender.profile?.city ?? null,
          mainPhoto: photo?.url ?? null,
        },
      };
    }

    // Compte FREE : le flou doit être appliqué côté serveur (transformation Cloudinary),
    // sinon la vraie photo/le prénom sont visibles dans la réponse réseau malgré le flou CSS.
    const blurredPhoto = photo?.cloudinaryId
      ? cloudinary.url(photo.cloudinaryId, { secure: true, transformation: [{ effect: "blur:1800" }] })
      : null;

    return {
      swipeId: l.id,
      action: l.action,
      createdAt: l.createdAt,
      user: {
        id: l.sender.id,
        firstName: null,
        age: null,
        city: null,
        mainPhoto: blurredPhoto,
      },
    };
  });
};

export const getSuperLikeRemainingService = async (userId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.swipe.count({
    where: {
      senderId: userId,
      action: "SUPER_LIKE",
      createdAt: { gte: startOfDay },
    },
  });

  return { used: count, remaining: Math.max(0, SUPER_LIKE_DAILY_LIMIT - count), limit: SUPER_LIKE_DAILY_LIMIT };
};

export const getMatchesService = async (userId: string) => {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
      isActive: true,
    },
    include: {
      userA: {
        include: {
          profile: true,
          photos: { where: { isMain: true } },
        },
      },
      userB: {
        include: {
          profile: true,
          photos: { where: { isMain: true } },
        },
      },
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: { messages: true },
          },
        },
      },
    },
    orderBy: { matchedAt: "desc" },
  });

  const conversationIds = matches
    .map((m) => m.conversation?.id)
    .filter(Boolean) as string[];

  const unreadCounts = conversationIds.length > 0
    ? await prisma.message.groupBy({
        by: ["conversationId"],
        where: {
          conversationId: { in: conversationIds },
          receiverId: userId,
          status: { not: "READ" },
        },
        _count: { id: true },
      })
    : [];

  const unreadMap = new Map(unreadCounts.map((r) => [r.conversationId, r._count.id]));

  return matches.map((m) => {
    const other = m.userAId === userId ? m.userB : m.userA;
    const age = other.profile
      ? Math.floor(
          (Date.now() - other.profile.birthDate.getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;
    const lastMessage = m.conversation?.messages[0] ?? null;
    const unreadCount = m.conversation ? (unreadMap.get(m.conversation.id) ?? 0) : 0;

    return {
      matchId: m.id,
      conversationId: m.conversation?.id ?? null,
      matchedAt: m.matchedAt,
      user: {
        id: other.id,
        firstName: other.profile?.firstName,
        age,
        city: other.profile?.city,
        mainPhoto: other.photos[0]?.url ?? null,
        isOnline: Date.now() - other.lastSeenAt.getTime() < 5 * 60 * 1000,
        isVerified: other.profile?.isVerified ?? false,
      },
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isFromMe: lastMessage.senderId === userId,
            status: lastMessage.status,
          }
        : null,
      unreadCount,
    };
  });
};
