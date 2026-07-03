import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const PDF_TYPE = 'application/pdf';
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const MAX_PDF_BYTES = 50 * 1024 * 1024;

async function checkOwnership(courseId, moduleId, lessonId, userId) {
  return prisma.lesson.findFirst({
    where: { id: lessonId, moduleId, module: { courseId, course: { authorId: userId } } },
  });
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const lesson = await checkOwnership(params.id, params.moduleId, params.lessonId, session.user.id);
  if (!lesson) return NextResponse.json({ error: 'Leçon introuvable' }, { status: 404 });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  }

  const isVideo = VIDEO_TYPES.includes(file.type);
  const isPDF = file.type === PDF_TYPE;

  if (!isVideo && !isPDF) {
    return NextResponse.json({
      error: 'Format non supporté. Formats acceptés : MP4, WebM, MOV, AVI, PDF',
    }, { status: 400 });
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_PDF_BYTES;
  if (file.size > maxBytes) {
    const limitMB = isVideo ? 500 : 50;
    return NextResponse.json({ error: `Fichier trop volumineux. Limite : ${limitMB} Mo` }, { status: 400 });
  }

  const originalExt = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'pdf');
  const fileName = `${params.lessonId}-${randomUUID().slice(0, 8)}.${originalExt}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'lessons');

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, fileName), buffer);

  const contentUrl = `/uploads/lessons/${fileName}`;

  await prisma.lesson.update({
    where: { id: params.lessonId },
    data: { contentUrl },
  });

  return NextResponse.json({ url: contentUrl, size: file.size, name: file.name });
}
