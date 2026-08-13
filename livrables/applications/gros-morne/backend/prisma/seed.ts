import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@grosmorne.ht';
  const password = process.env.SEED_ADMIN_PASSWORD || 'GrosMorne@123';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Compte ADMIN déjà présent : ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      nom: 'Administrateur',
      role: 'ADMIN',
    },
  });

  console.log(`Compte ADMIN créé : ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
