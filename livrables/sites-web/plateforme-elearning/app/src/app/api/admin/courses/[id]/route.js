import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { status } = await request.json();
  if (!['DRAFT', 'PUBLISHED'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const course = await prisma.course.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ id: course.id, status: course.status });
}
