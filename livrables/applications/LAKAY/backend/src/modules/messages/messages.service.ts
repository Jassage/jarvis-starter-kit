import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getIO } from '../../config/socket';
import { paginate, parsePagination } from '../../utils/response';

export async function getOrCreateConversation(userId: string, otherUserId: string, listingId?: string) {
  if (userId === otherUserId) throw new AppError('Vous ne pouvez pas vous envoyer un message', 400);

  // Chercher une conversation existante entre ces 2 utilisateurs pour cette annonce
  const existing = await prisma.conversation.findFirst({
    where: {
      ...(listingId && { listingId }),
      participants: {
        every: { userId: { in: [userId, otherUserId] } },
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      listing: { select: { id: true, title: true, images: { where: { isPrimary: true }, take: 1 } } },
    },
  });

  if (existing) return existing;

  // Créer nouvelle conversation
  return prisma.conversation.create({
    data: {
      listingId,
      participants: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      listing: { select: { id: true, title: true, images: { where: { isPrimary: true }, take: 1 } } },
    },
  });
}

export async function getConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      listing: {
        select: { id: true, title: true, images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });
}

export async function getMessages(conversationId: string, userId: string, query: Record<string, string>) {
  // Vérifier appartenance
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) throw new AppError('Accès refusé à cette conversation', 403);

  const { page, limit, skip } = parsePagination(query);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  // Marquer comme lu
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });

  return { messages: messages.reverse(), pagination: paginate(page, limit, total) };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string
) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant) throw new AppError('Accès refusé à cette conversation', 403);

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, content, attachmentUrl, attachmentType },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  // Diffusion temps réel
  try {
    const io = getIO();
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
    });

    io.to(`conv:${conversationId}`).emit('new_message', message);

    // Notifier les participants non connectés à la conversation
    for (const p of participants) {
      if (p.userId !== senderId) {
        io.to(`user:${p.userId}`).emit('message_notification', {
          conversationId,
          message,
        });
      }
    }
  } catch { /* Socket non disponible */ }

  return message;
}

export async function getUnreadCount(userId: string): Promise<number> {
  // 1 requête pour récupérer les conversations de l'utilisateur + son lastReadAt
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });
  if (participants.length === 0) return 0;

  // 1 seul count avec un OR par conversation (seuil lastReadAt propre à chacune)
  const orConditions = participants.map((p) => ({
    conversationId: p.conversationId,
    ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
  }));

  return prisma.message.count({
    where: {
      senderId: { not: userId },
      OR: orConditions,
    },
  });
}
