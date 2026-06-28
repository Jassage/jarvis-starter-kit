import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      // connection_limit : adapté à la charge concurrent (défaut Prisma ≈ num_cpus*2+1)
      // pgbouncer=true si PgBouncer est en frontal en production
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
