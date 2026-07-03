import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, email: true } },
      _count: { select: { enrollments: true, reviews: true } },
    },
  });

  return NextResponse.json(courses);
}
