import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const [totalUsers, publishedCourses, totalEnrollments, users, courses, allCourses, paidEnrollments, pendingCourses] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { enrollments: true } },
          enrollments: { select: { progress: true } },
        },
      }),
      prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.course.findMany({ where: { status: 'PUBLISHED' }, select: { category: true } }),
      prisma.enrollment.findMany({ include: { course: { select: { price: true } } } }),
      prisma.course.findMany({
        where: { status: 'PENDING_REVIEW' },
        orderBy: { submittedAt: 'asc' },
        include: { author: { select: { name: true } } },
      }),
    ]);

  const totalRevenue = paidEnrollments.reduce((s, e) => s + (e.course?.price || 0), 0);

  // Category distribution
  const catCount = {};
  allCourses.forEach(c => { catCount[c.category] = (catCount[c.category] || 0) + 1; });
  const catTotal = allCourses.length || 1;
  const categoryDistribution = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count, pct: Math.round((count / catTotal) * 100) }));

  // Monthly enrollments — last 12 months
  const now = new Date();
  const monthlyEnrollments = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      return prisma.enrollment.count({ where: { enrolledAt: { gte: start, lte: end } } });
    })
  );

  return NextResponse.json({
    kpis: { totalUsers, publishedCourses, totalEnrollments, totalRevenue },
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      enrollments: u._count.enrollments,
      avgProgress: u.enrollments.length > 0
        ? Math.round(u.enrollments.reduce((s, e) => s + e.progress, 0) / u.enrollments.length)
        : 0,
    })),
    courses,
    categoryDistribution,
    monthlyEnrollments,
    pendingCourses: pendingCourses.map(c => ({
      id: c.id,
      title: c.title,
      author: c.author?.name,
      submittedAt: c.submittedAt,
    })),
  });
}
