import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function startOfWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function parseDurationMinutes(duration) {
  const mmss = duration.match(/^(\d+):(\d+)$/);
  if (mmss) return Number(mmss[1]) + Number(mmss[2]) / 60;
  const min = duration.match(/^(\d+)\s*min$/i);
  if (min) return Number(min[1]);
  return 0;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const since = startOfWeek(new Date());

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, completed: true, completedAt: { gte: since } },
    include: { lesson: { select: { type: true, duration: true } } },
  });

  const lessonsCompleted = progress.length;
  const minutes = progress
    .filter(p => p.lesson.type === 'VIDEO')
    .reduce((s, p) => s + parseDurationMinutes(p.lesson.duration), 0);

  return NextResponse.json({ lessonsCompleted, hours: Math.round((minutes / 60) * 10) / 10 });
}
