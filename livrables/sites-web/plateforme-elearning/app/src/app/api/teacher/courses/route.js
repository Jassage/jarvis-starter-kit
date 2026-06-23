import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    where: { authorId: session.user.id },
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(courses);
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { title, description, category, level, price, hours } = await request.json();
  if (!title || !category) {
    return NextResponse.json({ error: 'title et category requis' }, { status: 400 });
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description: description || null,
      category,
      level: level || 'Tous niveaux',
      price: price ? parseFloat(price) : 0,
      hours: hours ? parseFloat(hours) : 0,
      status: 'DRAFT',
      authorId: session.user.id,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
