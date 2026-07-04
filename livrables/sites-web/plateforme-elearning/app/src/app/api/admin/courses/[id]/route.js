import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const ACTION_STATUS = {
  approve: 'PUBLISHED',
  reject: 'DRAFT',
  unpublish: 'DRAFT',
};

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { action } = await request.json();
  const newStatus = ACTION_STATUS[action];
  if (!newStatus) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { authorId: true, title: true } });
  if (!course) {
    return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
  }

  const updated = await prisma.course.update({ where: { id: params.id }, data: { status: newStatus } });

  if (action === 'approve') {
    await prisma.notification.create({
      data: {
        userId: course.authorId,
        icon: 'checkCircle',
        color: 'green',
        title: 'Cours validé et publié',
        body: `Ton cours « ${course.title} » a été validé et est maintenant en ligne.`,
      },
    });
  } else if (action === 'reject') {
    await prisma.notification.create({
      data: {
        userId: course.authorId,
        icon: 'flag',
        color: 'rose',
        title: 'Cours refusé',
        body: `Ton cours « ${course.title} » a été refusé. Révise-le et resoumets-le pour validation.`,
      },
    });
  }

  return NextResponse.json({ id: updated.id, status: updated.status });
}
