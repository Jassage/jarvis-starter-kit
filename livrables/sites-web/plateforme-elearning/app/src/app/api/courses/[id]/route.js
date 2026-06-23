import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = params;

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      status: 'PUBLISHED',
    },
    include: {
      author: { select: { name: true } },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
  }

  return NextResponse.json(course);
}
