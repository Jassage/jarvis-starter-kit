'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function registerUser({ name, email, password, role }) {
  if (!name || !email || !password) {
    return { error: 'Tous les champs sont requis.' };
  }
  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Un compte existe déjà avec cet email.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role === 'teacher' ? 'TEACHER' : 'STUDENT',
    },
  });

  return { ok: true, role: user.role };
}
