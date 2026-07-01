import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function checkOwnership(courseId, userId) {
  return prisma.course.findFirst({ where: { id: courseId, authorId: userId } });
}

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const owned = await checkOwnership(params.id, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  const modules = await prisma.module.findMany({
    where: { courseId: params.id },
    include: { lessons: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(modules);
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const owned = await checkOwnership(params.id, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  const { title } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

  const last = await prisma.module.findFirst({
    where: { courseId: params.id },
    orderBy: { order: 'desc' },
  });

  const module = await prisma.module.create({
    data: {
      title: title.trim(),
      order: (last?.order ?? 0) + 1,
      courseId: params.id,
    },
    include: { lessons: true },
  });

  return NextResponse.json(module, { status: 201 });
}
