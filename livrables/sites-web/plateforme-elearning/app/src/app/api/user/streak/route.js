import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = new Date(today);
  since.setDate(since.getDate() - 60);

  const logs = await prisma.activityLog.findMany({
    where: { userId: session.user.id, date: { gte: since } },
    select: { date: true },
    orderBy: { date: 'desc' },
  });

  const activeDates = new Set(logs.map(l => l.date.getTime()));

  let current = 0;
  const cursor = new Date(today);
  if (!activeDates.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDates.has(cursor.getTime())) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return activeDates.has(d.getTime());
  });

  return NextResponse.json({ current, days });
}
