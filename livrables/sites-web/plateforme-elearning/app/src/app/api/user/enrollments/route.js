import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) return NextResponse.json({ error: 'courseId requis' }, { status: 400 });

  const course = await prisma.course.findFirst({
    where: { id: courseId, status: 'PUBLISHED' },
  });
  if (!course) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) return NextResponse.json(existing, { status: 200 });

  if (course.price > 0) {
    return NextResponse.json({ error: 'PAYMENT_REQUIRED', price: course.price }, { status: 402 });
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId: session.user.id, courseId },
    include: { course: { include: { author: { select: { name: true } }, _count: { select: { enrollments: true } } } } },
  });

  return NextResponse.json(enrollment, { status: 201 });
}

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
