import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const member = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
