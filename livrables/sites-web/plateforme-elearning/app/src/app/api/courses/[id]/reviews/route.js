import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const myReview = await prisma.review.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: params.id } },
  });

  const agg = await prisma.review.aggregate({
    where: { courseId: params.id },
    _avg: { rating: true },
    _count: true,
  });

  return NextResponse.json({
    myReview,
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    count: agg._count,
  });
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { rating, comment } = await request.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Note invalide (1 à 5)' }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: params.id } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: 'Tu dois être inscrit à ce cours pour laisser un avis' }, { status: 403 });
  }

  const review = await prisma.review.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId: params.id } },
    update: { rating, comment: comment || null },
    create: { userId: session.user.id, courseId: params.id, rating, comment: comment || null },
  });

  return NextResponse.json(review);
}
