import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          certificates: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
