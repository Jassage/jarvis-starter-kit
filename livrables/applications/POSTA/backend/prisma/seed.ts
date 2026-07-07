import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@posta.ht';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMoi123!';

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    console.log(`Compte SUPER_ADMIN déjà présent : ${email}`);
    return;
  }

  const motDePasse = await bcrypt.hash(password, 12);
  await prisma.utilisateur.create({
    data: {
      email,
      motDePasse,
      nom: 'Admin',
      prenom: 'POSTA',
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`Compte SUPER_ADMIN créé : ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
