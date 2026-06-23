import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(courses);
}
