import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: { select: { title: true, color: true, author: { select: { name: true } } } },
    },
    orderBy: { issuedAt: 'desc' },
  });

  return NextResponse.json(certificates);
}
