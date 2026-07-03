import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { name: true } },
      _count: { select: { enrollments: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const withRating = courses.map(({ reviews, ...c }) => ({
    ...c,
    rating: reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0,
    reviewCount: reviews.length,
  }));

  return NextResponse.json(withRating);
}
