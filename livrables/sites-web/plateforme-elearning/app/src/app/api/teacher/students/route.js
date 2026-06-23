import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // Récupère les inscriptions dans les cours du formateur, triées par date
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { authorId: session.user.id } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { title: true, color: true } },
    },
    orderBy: { lastSeenAt: 'desc' },
    take: 20,
  });

  return NextResponse.json(enrollments);
}
