import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const motDePasseHash = await bcrypt.hash('Reyinyon@123', 12);

  const hote = await prisma.user.upsert({
    where: { email: 'demo@reyinyon.ht' },
    update: {},
    create: {
      nom: 'Démo Hôte',
      email: 'demo@reyinyon.ht',
      motDePasseHash,
      telephone: '+509 3700 0000',
    },
  });

  console.log(`Seed terminé. Compte hôte de démo : demo@reyinyon.ht / Reyinyon@123 (id=${hote.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
