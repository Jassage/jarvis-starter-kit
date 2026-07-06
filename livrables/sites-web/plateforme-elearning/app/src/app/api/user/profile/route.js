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
      weeklyGoal: true,
      bio: true,
      portfolioUrl: true,
      iban: true,
      payoutCurrency: true,
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

  const body = await request.json();
  const data = {};

  if (body.name !== undefined) {
    if (!body.name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    data.name = body.name.trim();
  }
  if (body.weeklyGoal !== undefined) {
    const goal = Number(body.weeklyGoal);
    if (!Number.isFinite(goal) || goal < 1 || goal > 50) {
      return NextResponse.json({ error: 'Objectif hebdomadaire invalide (1 à 50)' }, { status: 400 });
    }
    data.weeklyGoal = Math.round(goal);
  }
  if (body.bio !== undefined) data.bio = body.bio?.trim() || null;
  if (body.portfolioUrl !== undefined) data.portfolioUrl = body.portfolioUrl?.trim() || null;
  if (body.iban !== undefined) data.iban = body.iban?.trim() || null;
  if (body.payoutCurrency !== undefined) data.payoutCurrency = body.payoutCurrency || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true, name: true, email: true, role: true,
      weeklyGoal: true, bio: true, portfolioUrl: true, iban: true, payoutCurrency: true,
    },
  });

  return NextResponse.json(user);
}
