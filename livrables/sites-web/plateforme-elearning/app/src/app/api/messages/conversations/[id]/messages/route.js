import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function checkMembership(conversationId, userId) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const member = await checkMembership(params.id, session.user.id);
  if (!member) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const member = await checkMembership(params.id, session.user.id);
  if (!member) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { body } = await request.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { conversationId: params.id, senderId: session.user.id, body: body.trim() },
  });

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });

  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: params.id, userId: { not: session.user.id } },
  });
  if (otherParticipant) {
    await prisma.notification.create({
      data: {
        userId: otherParticipant.userId,
        icon: 'message',
        color: 'brand',
        title: `Nouveau message de ${session.user.name}`,
        body: body.trim().slice(0, 80),
      },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
