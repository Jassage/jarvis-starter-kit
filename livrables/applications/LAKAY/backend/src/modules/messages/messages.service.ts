import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getIO } from '../../config/socket';
import { encodeCursor, decodeCursor, buildCursorWhere } from '../../utils/cursorPagination';

interface MessagesCursor {
  createdAt: string;
  id: string;
}

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

/**
 * Historique d'une conversation, paginé par curseur (createdAt+id, tri antéchronologique).
 * Sans `cursor` : les `limit` messages les plus récents. Avec `cursor` (= nextCursor de
 * l'appel précédent) : les `limit` messages précédant le plus ancien déjà chargé — le
 * pattern "charger les messages plus anciens" au scroll vers le haut d'un chat.
 */
export async function getMessages(conversationId: string, userId: string, query: Record<string, string>) {
  // Vérifier appartenance
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) throw new AppError('Accès refusé à cette conversation', 403);

  const limit = Math.min(Math.max(parseInt(query.limit || '30', 10) || 30, 1), 100);
  const cursor = decodeCursor<MessagesCursor>(query.cursor);

  let where: Prisma.MessageWhereInput = { conversationId };
  if (cursor) {
    const cursorWhere = buildCursorWhere([
      { field: 'createdAt', direction: 'desc', value: new Date(cursor.createdAt) },
      { field: 'id', direction: 'desc', value: cursor.id },
    ]);
    where = { AND: [where, cursorWhere] };
  }

  const rows = await prisma.message.findMany({
    where,
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  let nextCursor: string | null = null;
  if (hasMore) {
    const oldest = page[page.length - 1];
    nextCursor = encodeCursor({ createdAt: oldest.createdAt.toISOString(), id: oldest.id });
  }

  // Marquer comme lu
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });

  return { messages: page.reverse(), pagination: { limit, hasMore, nextCursor } };
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
