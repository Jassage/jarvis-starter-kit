import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = await Promise.all(conversations.map(async (c) => {
    const me = c.participants.find(p => p.userId === session.user.id);
    const other = c.participants.find(p => p.userId !== session.user.id);
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: c.id,
        senderId: { not: session.user.id },
        createdAt: { gt: me?.lastReadAt ?? new Date(0) },
      },
    });

    return {
      id: c.id,
      courseId: c.courseId,
      otherUser: other?.user ?? null,
      lastMessage: c.messages[0] ?? null,
      unreadCount,
    };
  }));

  result.sort((a, b) => {
    const da = a.lastMessage?.createdAt ?? 0;
    const db = b.lastMessage?.createdAt ?? 0;
    return new Date(db) - new Date(da);
  });

  return NextResponse.json(result);
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { otherUserId, courseId } = await request.json();
  if (!otherUserId || otherUserId === session.user.id) {
    return NextResponse.json({ error: 'otherUserId invalide' }, { status: 400 });
  }

  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  const conversation = await prisma.conversation.create({
    data: {
      courseId: courseId || null,
      participants: {
        create: [{ userId: session.user.id }, { userId: otherUserId }],
      },
    },
  });

  return NextResponse.json({ id: conversation.id }, { status: 201 });
}
