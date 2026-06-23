import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Récupère les cours auxquels l'utilisateur est inscrit
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    select: { courseId: true },
  });
  const courseIds = enrollments.map(e => e.courseId);

  // Récupère tous les quizzes dans ces cours
  const quizzes = await prisma.quiz.findMany({
    where: { lesson: { module: { courseId: { in: courseIds } } } },
    include: {
      questions: { select: { id: true } },
      attempts: {
        where: { userId: session.user.id },
        orderBy: { completedAt: 'desc' },
        take: 1,
      },
      lesson: {
        include: {
          module: {
            include: {
              course: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  const result = quizzes.map(q => ({
    id: q.id,
    title: q.title,
    module: q.lesson.module.title,
    course: q.lesson.module.course.title,
    durationSeconds: q.durationSeconds,
    questionCount: q.questions.length,
    lastAttempt: q.attempts[0] || null,
    status: q.attempts[0]
      ? (q.attempts[0].passed ? 'passed' : 'failed')
      : 'available',
  }));

  return NextResponse.json(result);
}
