import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, price: true, color: true, author: { select: { name: true } } },
  });
  const priceMap = Object.fromEntries(courses.map(c => [c.id, c.price]));

  const enrollments = await prisma.enrollment.findMany({
    select: { courseId: true, enrolledAt: true },
  });

  const totalRevenue = enrollments.reduce((s, e) => s + (priceMap[e.courseId] || 0), 0);

  const now = new Date();
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    return enrollments
      .filter(e => e.enrolledAt >= start && e.enrolledAt <= end)
      .reduce((s, e) => s + (priceMap[e.courseId] || 0), 0);
  });

  const topCourses = courses
    .map(c => {
      const students = enrollments.filter(e => e.courseId === c.id).length;
      return { id: c.id, title: c.title, color: c.color, author: c.author?.name, price: c.price, students, revenue: students * c.price };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return NextResponse.json({ totalRevenue, monthly, topCourses });
}
