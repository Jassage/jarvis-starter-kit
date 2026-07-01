import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const VALID_TYPES = ['VIDEO', 'PDF', 'QUIZ', 'PROJECT'];

async function checkLessonOwnership(courseId, moduleId, lessonId, userId) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      moduleId,
      module: { courseId, course: { authorId: userId } },
    },
  });
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const owned = await checkLessonOwnership(params.id, params.moduleId, params.lessonId, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Leçon introuvable' }, { status: 404 });

  const { title, type, duration, order } = await request.json();

  const updated = await prisma.lesson.update({
    where: { id: params.lessonId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(type && VALID_TYPES.includes(type) && { type }),
      ...(duration !== undefined && { duration: duration.trim() || '—' }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const owned = await checkLessonOwnership(params.id, params.moduleId, params.lessonId, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Leçon introuvable' }, { status: 404 });

  await prisma.lesson.delete({ where: { id: params.lessonId } });
  return NextResponse.json({ ok: true });
}
