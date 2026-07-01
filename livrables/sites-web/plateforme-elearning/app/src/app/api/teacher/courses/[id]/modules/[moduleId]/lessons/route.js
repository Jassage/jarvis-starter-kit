import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const VALID_TYPES = ['VIDEO', 'PDF', 'QUIZ', 'PROJECT'];

async function checkModuleOwnership(courseId, moduleId, userId) {
  return prisma.module.findFirst({
    where: { id: moduleId, courseId, course: { authorId: userId } },
  });
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const owned = await checkModuleOwnership(params.id, params.moduleId, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 });

  const { title, type, duration } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

  const last = await prisma.lesson.findFirst({
    where: { moduleId: params.moduleId },
    orderBy: { order: 'desc' },
  });

  const lesson = await prisma.lesson.create({
    data: {
      title: title.trim(),
      type: VALID_TYPES.includes(type) ? type : 'VIDEO',
      duration: duration?.trim() || '—',
      order: (last?.order ?? 0) + 1,
      moduleId: params.moduleId,
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
