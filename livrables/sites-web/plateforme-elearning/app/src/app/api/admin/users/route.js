import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { enrollments: true, taughtCourses: true } },
    },
  });

  return NextResponse.json(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    enrollments: u._count.enrollments,
    taughtCourses: u._count.taughtCourses,
  })));
}

export async function PATCH(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { userId, role } = await request.json();
  if (!userId || !['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }
  if (userId === session.user.id) {
    return NextResponse.json({ error: 'Impossible de modifier ton propre rôle' }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json({ id: user.id, role: user.role });
}
