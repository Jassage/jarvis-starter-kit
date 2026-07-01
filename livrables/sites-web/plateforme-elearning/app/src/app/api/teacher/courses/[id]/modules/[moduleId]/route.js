import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function checkModuleOwnership(courseId, moduleId, userId) {
  return prisma.module.findFirst({
    where: { id: moduleId, courseId, course: { authorId: userId } },
  });
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const owned = await checkModuleOwnership(params.id, params.moduleId, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 });

  const { title, order } = await request.json();

  const updated = await prisma.module.update({
    where: { id: params.moduleId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(order !== undefined && { order }),
    },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const owned = await checkModuleOwnership(params.id, params.moduleId, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 });

  await prisma.module.delete({ where: { id: params.moduleId } });
  return NextResponse.json({ ok: true });
}
