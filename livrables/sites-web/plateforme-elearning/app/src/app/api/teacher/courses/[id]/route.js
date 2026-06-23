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

  const course = await prisma.course.findFirst({
    where: { id: params.id, authorId: session.user.id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const owned = await checkOwnership(params.id, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  const { title, description, category, level, price, hours, status } = await request.json();

  const updated = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(level && { level }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(hours !== undefined && { hours: parseFloat(hours) }),
      ...(status && { status }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const owned = await checkOwnership(params.id, session.user.id);
  if (!owned) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
