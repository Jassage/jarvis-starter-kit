import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          author: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { lastSeenAt: 'desc' },
  });

  return NextResponse.json(enrollments);
}
