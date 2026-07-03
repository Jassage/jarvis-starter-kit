import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const reviews = await prisma.review.findMany({
    where: { course: { authorId: session.user.id } },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const avgByCourse = {};
  reviews.forEach(r => {
    if (!avgByCourse[r.courseId]) avgByCourse[r.courseId] = { title: r.course.title, color: r.course.color, sum: 0, count: 0 };
    avgByCourse[r.courseId].sum += r.rating;
    avgByCourse[r.courseId].count += 1;
  });
  const courseAverages = Object.values(avgByCourse).map(c => ({ ...c, avg: Math.round((c.sum / c.count) * 10) / 10 }));

  const overallAvg = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return NextResponse.json({ reviews, courseAverages, overallAvg, total: reviews.length });
}
