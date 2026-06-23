import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  if (!courseId) {
    return NextResponse.json({ error: 'courseId requis' }, { status: 400 });
  }

  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: { module: { courseId } },
    },
    select: { lessonId: true, completed: true },
  });

  return NextResponse.json(progress);
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { lessonId, completed } = await request.json();
  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId requis' }, { status: 400 });
  }

  const record = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { userId: session.user.id, lessonId, completed, completedAt: completed ? new Date() : null },
  });

  // Recalcule le % de progression dans l'enrollment
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: { include: { modules: { include: { lessons: true } } } } } } },
  });

  if (lesson) {
    const courseId = lesson.module.courseId;
    const allLessons = lesson.module.course.modules.flatMap(m => m.lessons);
    const totalLessons = allLessons.length;

    if (totalLessons > 0) {
      const completedCount = await prisma.lessonProgress.count({
        where: {
          userId: session.user.id,
          completed: true,
          lesson: { module: { courseId } },
        },
      });

      const progressPct = Math.round((completedCount / totalLessons) * 100);

      await prisma.enrollment.updateMany({
        where: { userId: session.user.id, courseId },
        data: { progress: progressPct, lastSeenAt: new Date() },
      });
    }
  }

  return NextResponse.json(record);
}
