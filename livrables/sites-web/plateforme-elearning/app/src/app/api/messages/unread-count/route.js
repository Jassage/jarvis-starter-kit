import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    select: { conversationId: true, lastReadAt: true },
  });

  const counts = await Promise.all(memberships.map(m =>
    prisma.message.count({
      where: {
        conversationId: m.conversationId,
        senderId: { not: session.user.id },
        createdAt: { gt: m.lastReadAt },
      },
    })
  ));

  const total = counts.reduce((s, c) => s + c, 0);
  return NextResponse.json({ count: total });
}
