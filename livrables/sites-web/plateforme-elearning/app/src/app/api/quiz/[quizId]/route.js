import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/quiz/[quizId] — récupère le quiz avec ses questions
export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      questions: { orderBy: { order: 'asc' } },
    },
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz introuvable' }, { status: 404 });
  }

  return NextResponse.json(quiz);
}

// POST /api/quiz/[quizId] — enregistre une tentative
export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { score, passed } = await request.json();
  if (score == null || passed == null) {
    return NextResponse.json({ error: 'score et passed requis' }, { status: 400 });
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId: params.quizId,
      score,
      passed,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.activityLog.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    update: {},
    create: { userId: session.user.id, date: today },
  });

  return NextResponse.json(attempt);
}
