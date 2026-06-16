import { prisma } from "../lib/prisma";

export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  page = 1,
  limit = 30
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { match: true },
  });

  if (!conversation) throw new Error("Conversation introuvable");

  const { userAId, userBId } = conversation.match;
  if (userId !== userAId && userId !== userBId) {
    throw new Error("Accès refusé");
  }

  await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: userId,
      status: { not: "READ" },
    },
    data: { status: "READ" },
  });

  const otherUserId = userId === userAId ? userBId : userAId;
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    include: {
      profile: { select: { firstName: true } },
      photos: { where: { isMain: true }, select: { url: true } },
    },
  });
  const otherProfile = otherUser
    ? {
        firstName: otherUser.profile?.firstName ?? "",
        userId: otherUserId,
        mainPhoto: otherUser.photos[0]?.url ?? null,
        isOnline: Date.now() - otherUser.lastSeenAt.getTime() < 5 * 60 * 1000,
      }
    : null;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return { messages: messages.reverse(), otherUser: otherProfile, matchId: conversation.match.id };
};

export const sendMessageService = async (
  conversationId: string,
  senderId: string,
  content: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { match: true },
  });

  if (!conversation) throw new Error("Conversation introuvable");
  if (!conversation.match.isActive) throw new Error("Ce match n'est plus actif");

  const { userAId, userBId } = conversation.match;
  if (senderId !== userAId && senderId !== userBId) {
    throw new Error("Accès refusé");
  }

  const receiverId = senderId === userAId ? userBId : userAId;

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      receiverId,
      content: content.trim(),
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      title: "Nouveau message",
      body: content.length > 50 ? content.substring(0, 50) + "..." : content,
      data: { conversationId, senderId },
    },
  });

  return message;
};
